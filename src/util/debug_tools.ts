import { HDMap } from "./structure/hd_map";

//调试工具

class BaseWireframe {
    protected vertices_: Laya.Vector3[] = []
    protected color_ = Laya.Color.GREEN
    protected pls_: Laya.PixelLineSprite3D = null

    constructor() {}

    show(parent: Laya.Node)
    {
        if(this.pls_ && this.pls_.parent == null)
            parent.addChild(this.pls_)
    }

    hide()
    {
        if(this.pls_)
            this.pls_.removeSelf()
    }

    destroy()
    {
        if(this.pls_)
            this.pls_.destroy(true)
    }
}

class LineWireframe extends BaseWireframe {
    constructor(v1: Laya.Vector3, v2: Laya.Vector3, tag: string, color: Laya.Color = null)
    {
        super()

        this.color_ = color || Laya.Color.GREEN

        this.pls_ = new Laya.PixelLineSprite3D(12, tag + '_lwf')
        this.pls_.addLine(v1, v2, this.color_, this.color_)
    }

    update(v1: Laya.Vector3, v2: Laya.Vector3, color: Laya.Color = null)
    {
        if(color)
            this.color_ = color

        this.pls_.setLine(0, v1, v2, this.color_, this.color_)
    }
}

/** 统一y轴的矩形线框 */
class RectXZWireframe extends BaseWireframe {
    //4个顶点
    private indices_: number[] = []
    private r_: Laya.Rectangle = null

    constructor(r: Laya.Rectangle, tag: string, color: Laya.Color = null, y = 0)
    {
        super()

        this.color_ = color || Laya.Color.GREEN

        let a = new Laya.Vector3(r.x, y, r.y)
        let b = new Laya.Vector3(r.right, y, r.y)
        let c = new Laya.Vector3(r.right, y, r.bottom)
        let d = new Laya.Vector3(r.x, y, r.bottom)

        this.r_ = r

                            //index
        this.vertices_.push(a) //0
        this.vertices_.push(b) //1
        this.vertices_.push(c) //2
        this.vertices_.push(d) //3

        this.indices_ = [ 0, 1, 0, 3, 1, 2, 2, 3 ]

        this.pls_ = new Laya.PixelLineSprite3D(12, tag + '_rxzwf')
        for(let i = 0; i < this.indices_.length; i += 2)
        {
            let p1 = this.indices_[i] ? this.vertices_[this.indices_[i]] : this.vertices_[0]
            let p2 = this.indices_[i + 1] ? this.vertices_[this.indices_[i + 1]] : this.vertices_[0]
            this.pls_.addLine(p1, p2, this.color_, this.color_)
        }
    }

    update(color: Laya.Color = null, y = 0)
    {
        if(this.pls_)
        {
            if(color)
                this.color_ = color

            let r = this.r_

            this.vertices_[0].setValue(r.x, y, r.y)
            this.vertices_[1].setValue(r.right, y, r.y)
            this.vertices_[2].setValue(r.right, y, r.bottom)
            this.vertices_[3].setValue(r.x, y, r.bottom)

            let idx = 0
            for(let i = 0; i < this.indices_.length; i += 2)
            {
                let p1 = this.indices_[i] ? this.vertices_[this.indices_[i]] : this.vertices_[0]
                let p2 = this.indices_[i + 1] ? this.vertices_[this.indices_[i + 1]] : this.vertices_[0]
                this.pls_.setLine(idx++, p1, p2, this.color_, this.color_)
            }
        }
    }
}

class BoxWireframe extends BaseWireframe {
    //8个顶点
    private indices_: number[] = []
    private bb_: Laya.Bounds = null

    constructor(box: Laya.Bounds, tag: string, color: Laya.Color = null)
    {
        super()

        this.color_ = color || Laya.Color.GREEN

        let bb = box

        let a = bb.getMin()
        let b = new Laya.Vector3(bb.getMin().x, bb.getMax().y, bb.getMin().z)
        let c = new Laya.Vector3(bb.getMin().x, bb.getMin().y, bb.getMax().z)
        let d = new Laya.Vector3(bb.getMax().x, bb.getMin().y, bb.getMin().z)
        let e = new Laya.Vector3(bb.getMin().x, bb.getMax().y, bb.getMax().z)
        let f = new Laya.Vector3(bb.getMax().x, bb.getMax().y, bb.getMin().z)
        let g = new Laya.Vector3(bb.getMax().x, bb.getMin().y, bb.getMax().z)
        let h = bb.getMax()

        this.bb_ = bb

                            //index
        this.vertices_.push(a) //0
        this.vertices_.push(b) //1
        this.vertices_.push(c) //2
        this.vertices_.push(d) //3
        this.vertices_.push(e) //4
        this.vertices_.push(f) //5
        this.vertices_.push(g) //6
        this.vertices_.push(h) //7

        this.indices_ = [ 0, 1, 0, 2, 0, 3, 1, 4, 1, 5, 7, 4, 7, 5, 7, 6, 6, 2, 6, 3, 2, 4, 3, 5 ]

        this.pls_ = new Laya.PixelLineSprite3D(12, tag + '_bwf')
        for(let i = 0; i < this.indices_.length; i += 2)
        {
            let p1 = this.indices_[i] ? this.vertices_[this.indices_[i]] : this.vertices_[0]
            let p2 = this.indices_[i + 1] ? this.vertices_[this.indices_[i + 1]] : this.vertices_[0]
            this.pls_.addLine(p1, p2, this.color_, this.color_)
        }
    }

    update(color: Laya.Color = null)
    {
        if(this.pls_)
        {
            if(color)
                this.color_ = color

            let bb = this.bb_

            this.vertices_[0] = bb.getMin()
            this.vertices_[1].setValue(bb.getMin().x, bb.getMax().y, bb.getMin().z)
            this.vertices_[2].setValue(bb.getMin().x, bb.getMin().y, bb.getMax().z)
            this.vertices_[3].setValue(bb.getMax().x, bb.getMin().y, bb.getMin().z)
            this.vertices_[4].setValue(bb.getMin().x, bb.getMax().y, bb.getMax().z)
            this.vertices_[5].setValue(bb.getMax().x, bb.getMax().y, bb.getMin().z)
            this.vertices_[6].setValue(bb.getMax().x, bb.getMin().y, bb.getMax().z)
            this.vertices_[7] = bb.getMax()

            let idx = 0
            for(let i = 0; i < this.indices_.length; i += 2)
            {
                let p1 = this.indices_[i] ? this.vertices_[this.indices_[i]] : this.vertices_[0]
                let p2 = this.indices_[i + 1] ? this.vertices_[this.indices_[i + 1]] : this.vertices_[0]
                this.pls_.setLine(idx++, p1, p2, this.color_, this.color_)
            }
        }
    }
}

export class HDDebugTools {
    private static wireframeMap_ = new HDMap() //k: obj name v: Wireframe

    private static primitiveBoundMap_ = new HDMap()

    /**
     * 绘制包围盒线框，调试用
     * @param box 要绘制的包围盒
     * @param tag 包围盒命名
     * @param parent 包围盒添加到哪个父节点上显示
     * @param color 线框颜色
     */
    public static drawBoxWireframe(box: Laya.Bounds, tag: string, parent: Laya.Node, color: Laya.Color = null)
    {
        let bwf: BoxWireframe = null
        if(this.wireframeMap_.containsKey(tag))
        {
            bwf = this.wireframeMap_.get(tag)
            bwf.update(color)
        }
        else
        {
            bwf = new BoxWireframe(box, tag, color)
            this.wireframeMap_.put(tag, bwf)
        }

        if(bwf)
            bwf.show(parent)
    }

    /**
     * 绘制线条
     * @param v1 线条的顶点之一
     * @param v2 线条的顶点之一
     * @param tag 线条名
     * @param parent 线条添加到哪个父节点上显示
     * @param color 线框颜色
     */
    public static drawLineWireframe(v1: Laya.Vector3, v2: Laya.Vector3, tag: string, parent: Laya.Node = null, color: Laya.Color = null)
    {
        let lwf: LineWireframe = null
        if(this.wireframeMap_.containsKey(tag))
        {
            lwf = this.wireframeMap_.get(tag)
            lwf.update(v1, v2, color)
        }
        else
        {
            lwf = new LineWireframe(v1, v2, tag, color)
            this.wireframeMap_.put(tag, lwf)
        }

        if(lwf)
            lwf.show(parent)
    }

    /**
     * 绘制一个y轴坐标固定的矩形线框，需要注意的是，如果是透视相机，矩形线框依然有近大远小的原则，
     * 如果y轴不是和原本的模型底座一致，那么没有对准摄像机中心时将会产生视觉上的绘制偏移
     * @param rect 要绘制的矩形
     * @param tag 矩形名
     * @param parent 矩形添加到哪个父节点上显示
     * @param color 矩形颜色
     * @param y 固定的y轴，用于指定投影的高低，在某些时候便于观察绘制框
     */
    public static drawRectXZWireframe(rect: Laya.Rectangle, tag: string, parent: Laya.Node = null, color: Laya.Color = null, y = 0)
    {
        let rwf: RectXZWireframe = null
        if(this.wireframeMap_.containsKey(tag))
        {
            rwf = this.wireframeMap_.get(tag)
            rwf.update(color)
        }
        else
        {
            rwf = new RectXZWireframe(rect, tag, color, y)
            this.wireframeMap_.put(tag, rwf)
        }

        if(rwf)
            rwf.show(parent)
    }

    public static hideWireframe(tag: string)
    {
        if(this.wireframeMap_.containsKey(tag))
        {
            let wf = this.wireframeMap_.get(tag)
            wf.hide()
        }
    }

    public static removeWireframe(tag: string)
    {
        if(this.wireframeMap_.containsKey(tag))
        {
            let wf: BoxWireframe = this.wireframeMap_.get(tag)
            wf.destroy()

            this.wireframeMap_.remove(tag)
        }
    }

    public static drawCylinderXZ(tag: string, radius: number, height: number, refObj: Laya.MeshSprite3D, y = 0, slices = 32)
    {
        let cylinder: Laya.MeshSprite3D = null
        if(this.primitiveBoundMap_.containsKey(tag))
        {
            cylinder = this.primitiveBoundMap_.get(tag)
            cylinder.transform.localPositionY = y
        }
        else
        {
            cylinder = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createCylinder(radius, height, slices))
            cylinder.transform.localPositionY = y
            this.primitiveBoundMap_.put(tag, cylinder)
        }

        if(cylinder && !cylinder.parent)
            refObj.addChild(cylinder)
    }

    public static hidePrimitive(tag: string)
    {
        if(this.primitiveBoundMap_.containsKey(tag))
        {
            let pr = this.primitiveBoundMap_.get(tag) as Laya.MeshSprite3D
            pr.removeSelf()
            // pr.active = false
        }
    }

    public static removePrimitive(tag: string)
    {
        if(this.primitiveBoundMap_.containsKey(tag))
        {
            let pr: Laya.MeshSprite3D = this.primitiveBoundMap_.get(tag)
            pr.destroy(true)

            this.primitiveBoundMap_.remove(tag)
        }
    }
}