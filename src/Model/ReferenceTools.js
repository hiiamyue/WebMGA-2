import {
    GridHelper,
    LineBasicMaterial,
    Vector3,
    Color,
    BufferGeometry,
    Line,
    Box3Helper,
    Box3,
    SphereBufferGeometry,
    MeshBasicMaterial,
    Mesh
} from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {Alert} from 'rsuite';

export class ReferenceTools {
    subGrid;
    axes = [];
    boundingShape;
    boudningSize;
    boundingCenter;
    boundingShapeType;
    periodicBounding=[];
    setsGeometry;
    size;
    colour;
    material;
    R;G;B;

    constructor(s, c) {
        this.size = s;
        this.colour = c;

        this.material = new LineBasicMaterial({
            color: this.colour,
            linewidth: 3
        });

        this.multicolour = true;
        this.genMulticolourAxes();
        this.genSubgrid();

        this.R = new Color("rgb(255, 0, 0)");
        this.G = new Color("rgb(0, 255, 0)");
        this.B = new Color("rgb(0, 0, 255)");

        this.boundingShapeType = 'box';
        this.setsGeometry = null;
        this.boundingSize = null;
        this.boundingCenter = null;
        this.periodicBounding = null;
    }

    genBoundingShape(type, sets) {
        this.boundingShapeType = type;

        this.boundingShape = null;
        
        // if (this.setsGeometry == null) {
        //     let geometries = [];
        //     for (let set of sets) {
        //         for (let elem of set.elements) {
        //             geometries.push(BufferGeometryUtils.mergeBufferGeometries(elem.geometries));
        //         }
        //     }
        //     this.setsGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries);
        // }
        
        
        let geometries = [];
        for (let set of sets) {
            for (let elem of set.elements) {
                geometries.push(BufferGeometryUtils.mergeBufferGeometries(elem.geometries));
                }
        }
        this.setsGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries);
        
        switch (type) {
            case 'box':
                let box = new Box3();
                //box.setFromCenterAndSize(new Vector3(0,0,0),new Vector3(10,10,10));
                this.setsGeometry.computeBoundingBox()
                box.copy(this.setsGeometry.boundingBox);
                this.boundingShape = new Box3Helper(box, this.colour);
                let box_size = new Vector3(5,5,5);
                box_size =box.getSize();
                let box_center = new Vector3(0,0,0);
                box_center =box.getCenter()
                this.boundingSize = box_size;
                this.boundingCenter = box_center;
                break;
            case 'sphere':
                this.setsGeometry.computeBoundingSphere();
                let sphere = this.setsGeometry.boundingSphere;
                let geom = new SphereBufferGeometry(sphere.radius, 10, 10);
                geom.translate(sphere.center.x, sphere.center.y, sphere.center.z);
                let material = new MeshBasicMaterial({ color: this.colour });
                material.wireframe = true;
                this.boundingShape = new Mesh(geom, material);
                break;
            case 'cylinder':
                // this.boundingShape.copy(this.setsGeometry.computeBoundingBox());
                 break;
            default:
            Alert.error('Error: Unknown bounding shape identifier');
        }

        return this.boundingShape;

    }

    genPeriodicBouding(){
        this.periodicBounding =[];
        let box_size = this.boundingSize;
        let box_center = this.boundingCenter;
        let new_center = box_center.clone();
        // new_center.x= box_center.x-box_size.x;
        // let box = new Box3();
        // box.setFromCenterAndSize(new_center,box_size);
        // this.periodicBounding.push(new Box3Helper(box, this.colour))
        let center = box_center.clone();
        for (let i =-1;i<2;i++){
            center.x = new_center.x+box_size.x*i;
            for(let j =-1;j<2;j++){
                center.y = new_center.y+box_size.y*j;
                let box = new Box3();
                box.setFromCenterAndSize(center,box_size);
                this.periodicBounding.push(new Box3Helper(box, this.colour))
            }
        }
        return this.periodicBounding;
    }
    updateColour(colour) {
        this.colour = colour;
        this.material = new LineBasicMaterial({
            color: this.colour,
            linewidth: 5
        });
        if(!this.multicolour){
            this.genAxes();
        }
        this.genSubgrid();
    }

    updateSize(size) {
        this.size = size;
        if(this.multicolour){
            this.genMulticolourAxes();
        }else{
            this.genAxes();
        }
        this.genSubgrid();
    }

    genSubgrid() {
        this.subGrid = new GridHelper(this.size, this.size, this.colour, this.colour);
    }

    genAxes() {
        this.axes = [];
        let axesSize = this.size / 2;
        this.axes.push(new Line(new BufferGeometry().setFromPoints([new Vector3(-axesSize, 0, 0), new Vector3(axesSize, 0, 0)]), this.material));
        this.axes.push(new Line(new BufferGeometry().setFromPoints([new Vector3(0, -axesSize, 0), new Vector3(0, axesSize, 0)]), this.material));
        this.axes.push(new Line(new BufferGeometry().setFromPoints([new Vector3(0, 0, -axesSize), new Vector3(0, 0, axesSize)]), this.material));
    }

    genMulticolourAxes(){
        this.axes = [];
        let axesSize = this.size / 2;
        let mat1, mat2, mat3;
        mat1 = new LineBasicMaterial({
            color: this.R,
            linewidth: 5
        });
        this.axes.push(new Line(new BufferGeometry().setFromPoints([new Vector3(-axesSize, 0, 0), new Vector3(axesSize, 0, 0)]), mat1));
        mat2 = this.material = new LineBasicMaterial({
            color: this.G,
            linewidth: 5
        });
        this.axes.push(new Line(new BufferGeometry().setFromPoints([new Vector3(0, -axesSize, 0), new Vector3(0, axesSize, 0)]), mat2));
        mat3 = this.material = new LineBasicMaterial({
            color: this.B,
            linewidth: 5
        });
        this.axes.push(new Line(new BufferGeometry().setFromPoints([new Vector3(0, 0, -axesSize), new Vector3(0, 0, axesSize)]), mat3));
    }

    toggleMulticolour(){
        this.multicolour = !this.multicolour;
        if(this.multicolour){
            this.genMulticolourAxes();
        }else{
            this.updateColour(this.colour);
            this.genAxes();
        }
    }
   

}

export default ReferenceTools;