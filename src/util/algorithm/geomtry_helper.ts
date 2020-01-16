import { G } from "../global_def";

export class SegInterResult {
    constructor(p: Laya.Point, v1: Laya.Point, v2: Laya.Point)
    {
        this.point = p.copy(p)
        this.vertex1 = v1.copy(v1)
        this.vertex2 = v2.copy(v2)
    }

    point: Laya.Point = null //交点
    vertex1: Laya.Point = null //被检测的线段的一个端点
    vertex2: Laya.Point = null //被检测的线段的另一个端点
}

export class HDCircle {
    x = 0 //圆心x坐标
    y = 0 //圆心y坐标
    radius = 0 //半径

    tag = ''

    constructor(cx: number, cy: number, radius: number)
    {
        this.x = cx
        this.y = cy
        this.radius = radius
    }
}

export class GeomtryHelper {
    /**
     * 获取指定3D精灵的aabb包围盒，并可以指定其各轴上的缩放比例
     * @param sp3d 目标精灵
     * @param sclX 包围盒x方向上的缩放比
     * @param sclY 包围盒y方向上的缩放比
     * @param sclZ 包围盒z方向上的缩放比
     */
    public static getBoundingBox(sp3d: Laya.MeshSprite3D, sclX = 1, sclY = 1, sclZ = 1)
    {
        if(sclX === 1 && sclY === 1 && sclZ === 1)
        {
            return sp3d.meshRenderer.bounds
        }
        else
        {
            let origBb = sp3d.meshRenderer.bounds
            let center = origBb.getCenter()
            let extent = origBb.getExtent()
            
            extent.x *= sclX
            extent.y *= sclY
            extent.z *= sclZ

            let bb = new Laya.Bounds(new Laya.Vector3(), new Laya.Vector3())
            bb.setCenter(center)
            bb.setExtent(extent)

            return bb
        }
    }

    /**
     * 将3d精灵的包围盒转化为投影到xz平面上的矩形
     * @param sp3d 目标精灵
     * @param sclX 包围盒x方向上的缩放比
     * @param sclZ 包围盒z方向上的缩放比
     */
    public static convertBound2RectXZ(sp3d: Laya.MeshSprite3D, sclX = 1, sclZ = 1)
    {
        let bb = this.getBoundingBox(sp3d, sclX, 1, sclZ)

        let ret = new Laya.Rectangle()
        ret.x = bb.getMin().x
        ret.y = bb.getMin().z
        ret.width = Math.abs(bb.getMax().x - ret.x)
        ret.height = Math.abs(bb.getMax().z - ret.y)

        return ret
    }

    public static convertBound2CircleXZ(sp3d: Laya.MeshSprite3D, sclXZ = 1)
    {
        let bb = this.getBoundingBox(sp3d, sclXZ, 1, sclXZ)

        let center = bb.getCenter()

        let dx = bb.getMax().x - bb.getMin().x
        let dz = bb.getMax().z - bb.getMin().z
        let rad = Math.sqrt(dz * dz + dx * dx) / 2

        return new HDCircle(center.x, center.z, rad)
    }

    /**
     * 获取xz平面投影矩形的顶点
     * @param rect 目标矩形
     * @param out 需要传入长度为4的数组接收顶点，输出的顶点顺序为0：左上 1：右上 2：右下 3：左下
     */
    public static getRectXZVertices(rect: Laya.Rectangle, out: Laya.Point[])
    {
        out[0].x = rect.x
        out[0].y = rect.y

        out[1].x = rect.right
        out[1].y = rect.y

        out[2].x = rect.right
        out[2].y = rect.bottom

        out[3].x = rect.x
        out[3].y = rect.bottom
    }

    /**
     * 2D空间中两向量是否平行
     */
    static isParallelVec2D(v1: Laya.Vector2, v2: Laya.Vector2)
    {
        let n1 = new Laya.Vector2()
        Laya.Vector2.normalize(v1, n1)

        let n2 = new Laya.Vector2()
        Laya.Vector2.normalize(v2, n2)

        let num = Laya.Vector2.dot(n1, n2)
        if(G.isEqualF(Math.abs(num), 1))
            return true

        return false
    }

    /**
     * 3D空间中两向量是否平行
     */
    static isParallelVec3D(v1: Laya.Vector3, v2: Laya.Vector3)
    {
        let n1 = new Laya.Vector3()
        Laya.Vector3.normalize(v1, n1)

        let n2 = new Laya.Vector3()
        Laya.Vector3.normalize(v2, n2)

        let num = Laya.Vector3.dot(n1, n2)
        if(G.isEqualF(Math.abs(num), 1))
            return true

        return false
    }

    /**
     * 检测一点是否在线段上
     * @param p1 线段的一个端点
     * @param p2 线段另一个端点
     * @param q 待检测的点
     */
    static isPointOnSegment2D(p1: Laya.Point, p2: Laya.Point, q: Laya.Point)
    {
        /*
            如果想判断一个点是否在线段上，那么要满足以下两个条件：
            第一点通俗点理解就是要求Q、P1、P2三点共线；当第一个满足后，就应该考虑是否会出现Q在P1P2延长线或反向延长线这种情况。
            此时第二个条件就对Q点的横纵坐标进行了限制，要求横纵坐标要在P1P2两点的最小值和最大值之间，也就是说保证了Q在P1P2之间
        */
        let crossProd1 = (q.x - p1.x) * (p2.y - p1.y)
        let crossProd2 = (p2.x - p1.x) * (q.y - p1.y)

        let ret = G.isEqualF(crossProd1, crossProd2) && 
            Math.min(p1.x, p2.x) <= q.x && Math.max(p1.x, p1.x) >= q.x &&
            Math.min(p1.y, p2.y) <= q.y && Math.max(p1.y, p2.y) >= q.y

        return ret
    }

    /**
     * 检测2D空间中两条线段是否相交
     * @param a 线段1的一个端点
     * @param b 线段1的另一个端点
     * @param c 线段2的一个端点
     * @param d 线段2的另一个端点
     * @returns 返回交点坐标
     */
    static intersectSeg2Seg2D(a: Laya.Point, b: Laya.Point, c: Laya.Point, d: Laya.Point)
    {
        //如果"线段ab和点c构成的三角形面积"与"线段ab和点d构成的三角形面积" 
        //构成的三角形面积的正负符号相异, 那么点c和点d位于线段ab两侧

        // 三角形abc 面积的2倍  
        let areaABC = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x)
      
        // 三角形abd 面积的2倍  
        let areaABD = (a.x - d.x) * (b.y - d.y) - (a.y - d.y) * (b.x - d.x)
      
        // 面积符号相同则两点在线段同侧,不相交 (对点在线段上的情况,当作不相交处理);  
        if (areaABC * areaABD >= 0) 
        {  
            return null
        }  
      
        // 三角形cda 面积的2倍  
        let areaCDA = (c.x - a.x) * (d.y - a.y) - (c.y - a.y) * (d.x - a.x)
        // 三角形cdb 面积的2倍，通过已知的三个面积加减得出.  
        let areaCDB = areaCDA + areaABC - areaABD
        if (areaCDA * areaCDB >= 0) 
        {  
            return null
        }  
      
        //计算交点坐标  
        let t = areaCDA / (areaABD - areaABC)
        let dx= t * (b.x - a.x),  
            dy= t * (b.y - a.y);  

        return new Laya.Point(a.x + dx, a.y + dy)
    }  

    private static pnts_: Laya.Point[] = [ 
        new Laya.Point(),
        new Laya.Point(),
        new Laya.Point(),
        new Laya.Point(),
    ]

    private static indices_ = [ 0, 1, 0, 3, 1, 2, 2, 3 ]

    /**
     * 检测2D空间中线段与矩形是否相交
     * @param a 线段的一个端点
     * @param b 线段的另一个端点
     * @param rect 受检测的矩形
     * @return 返回一组相交数组，包括交点和被检测的矩形边的端点数据
     */
    static intersectSeg2Rect2D(a: Laya.Point, b: Laya.Point, rect: Laya.Rectangle)
    {
        let ret: SegInterResult[] = []

        this.getRectXZVertices(rect, this.pnts_)

        for(let i = 0; i < this.indices_.length; i += 2)
        {
            let p1 = this.indices_[i] ? this.pnts_[this.indices_[i]] : this.pnts_[0]
            let p2 = this.indices_[i + 1] ? this.pnts_[this.indices_[i + 1]] : this.pnts_[0]

            let p = this.intersectSeg2Seg2D(a, b, p1, p2)
            if(p)
            {
                let res = new SegInterResult(p, p1, p2)
                ret.push(res)
            }
        }

        return ret
    }

    /**
     * 直线与圆的交点检测，可能返回0~2长度的交点数组，长度0代表没有相交，1代表只有一个交点，2为两个交点
     * @param p1 直线上的一点
     * @param p2 直线上的另一个点
     * @param circle 待检测的圆
     */
    static intersectLine2Circle2D(p1: Laya.Point, p2: Laya.Point, circle: HDCircle, bSeg = false)
    {
        let ret: Laya.Point[] = []

        let dx = p2.x - p1.x
        let dy = p2.y - p1.y

        let p1cx = p1.x - circle.x
        let p1cy = p1.y - circle.y

        let A = dx * dx + dy * dy
        let B = 2 * (dx * p1cx + dy * p1cy)
        let C = p1cx * p1cx + p1cy * p1cy - circle.radius * circle.radius

        let delta = B * B - 4 * A * C

        //No real solutions
        if(A <= 0.0000001 || delta < 0)
        {
            
        }
        else if(delta === 0) //only one intersection
        {
            let t = -B / (2 * A)
            if(bSeg)
            {
                //如果线段和圆相切，则只有1个解，且在0和1之间
                if(t >= 0 && t <= 1)
                {
                    ret[0] = new Laya.Point(p1.x + t * dx, p1.y + t * dy)
                }
            }
            else
                ret[0] = new Laya.Point(p1.x + t * dx, p1.y + t * dy)
        }
        else
        {
            let t1 = (-B + Math.sqrt(delta)) / (2 * A)
            let t2 = (-B - Math.sqrt(delta)) / (2 * A)
            if(bSeg)
            {
                //如果线段和圆没有交点，而且都在圆的外面的话，则两个解都是小于0或者大于1的
                if(t1 < 0 && t2 < 0 || t1 > 1 && t2 > 1)
                {
                    //segment out of the circle
                }
                //如果线段和圆没有交点，而且都在圆的里面的话，两个解符号相反，一个小于0，一个大于1
                else if(t1 < 0 && t2 > 1 || t1 > 1 && t2 < 0)
                {
                    //segment is in the circle
                }
                //如果线段和圆只有一个交点，则解中有一个是在0和1之间，另一个不是
                else if(t1 >= 0 && t1 <= 1 && (t2 < 0 || t2 > 1))
                {
                    ret[0] = new Laya.Point(p1.x + t1 * dx, p1.y + t1 * dy)
                }
                else if(t2 >= 0 && t2 <= 1 && (t1 < 0 || t1 > 1))
                {
                    ret[0] = new Laya.Point(p1.x + t2 * dx, p1.y + t2 * dy)
                }
                //如果线段和圆有两个交点，则两个解都在0和1之间
                else if(t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1)
                {
                    ret[0] = new Laya.Point(p1.x + t1 * dx, p1.y + t1 * dy)
                    ret[1] = new Laya.Point(p1.x + t2 * dx, p1.y + t2 * dy)
                }
            }
            else
            {
                //two solutions
                ret[0] = new Laya.Point(p1.x + t1 * dx, p1.y + t1 * dy)
                ret[1] = new Laya.Point(p1.x + t2 * dx, p1.y + t2 * dy)
            }
        }

        return ret
    }

    /**
     * 线段与圆的交点检测
     * @param p1 线段的一个端点
     * @param p2 线段的另一个端点
     * @param circle 待检测的圆
     */
    static intersectSeg2Circle2D(p1: Laya.Point, p2: Laya.Point, circle: HDCircle)
    {
        return this.intersectLine2Circle2D(p1, p2, circle, true)
    }
}