
import { G } from "../util/global_def";
import { GameEventMgr, EventType } from "../util/event_mgr";
import { HDMap } from "../util/structure/hd_map";
import { AudioMgr, BgmType } from "../util/audio_mgr";
import { GameUserInfo, PlayerProp } from "./user_info";
import { BuffMgr } from "./buff";
import { ResManager } from "../util/res_mgr";
import { TimedTaskMgr } from "../util/timed_task";
import { GameHUD } from "../game_ui/game_hud";
import { HomeHUD } from "../game_ui/home_hud";
import { HDDebugTools } from "../util/debug_tools";
import { MathHelper } from "../util/algorithm/math_helper";
import { GeomtryHelper, SegInterResult, HDCircle } from "../util/algorithm/geomtry_helper";

//示例场景代码，根据自己的需求进行修改或者直接删除
export class Stage extends Laya.Script3D {
    private cam_: Laya.Camera = null

    private touchPos_ = new Laya.Vector2()

    private ray_ = new Laya.Ray(new Laya.Vector3(), new Laya.Vector3())

    private tree_: Laya.MeshSprite3D = null
    private treeSclTimer_ = 0

    private rocks_: Laya.MeshSprite3D[] = []
    private float_: Laya.MeshSprite3D = null

    private stick1_: Laya.MeshSprite3D = null //用于与圆交点检测表现
    private stick2_: Laya.MeshSprite3D = null //用于与圆交点检测表现

    private circles_: HDCircle[] = []
    
    private sea_: Laya.MeshSprite3D = null

    private horVecN_: Laya.Vector3 = new Laya.Vector3(1, 0, 0)
    private verVecN_: Laya.Vector3 = new Laya.Vector3(0, 0, 1)

    private reflectLine_ = new Laya.Vector3()

    private bHome_ = false

    private bTouched_ = false

    init()
    {
        let sc = this.owner as Laya.Scene3D
        sc.enableFog = true;
        sc.fogColor = new Laya.Vector3(0.9, 1, 1);
        sc.fogStart = 6
        sc.fogRange = 12

        let cam = this.owner.getChildByName('Main Camera') as Laya.Camera
        if(cam)
        {
            cam.clearFlag = Laya.BaseCamera.CLEARFLAG_SKY

            ResManager.instance.loadMaterial(ResManager.nativePath + '3d/Sky/skyBox.lmat', (mat: Laya.SkyBoxMaterial)=>{
                let skyRenderer: Laya.SkyRenderer = sc.skyRenderer
                skyRenderer.mesh = Laya.SkyBox.instance
                skyRenderer.material = mat
            })
            
            this.cam_ = cam
            // this.cam_.orthographic = true
            cam.enableHDR = false //务必要将此置为false，部分安卓低端机型不支持高精度的shader数据类型，会变为黑屏
        }

        let hn = sc.getChildByName('homeNode')
        if(hn)
        {
            let t = hn.getChildByName('tree') as Laya.MeshSprite3D
            if(t)
            {
                t.transform.scale = new Laya.Vector3(0.5, 0.5, 0.5)
                //绘制包围盒示例
                HDDebugTools.drawBoxWireframe(t.meshRenderer.bounds, t.name, sc, Laya.Color.RED)

                this.tree_ = t
            }

            let u = hn.getChildByName('unbrella') as Laya.MeshSprite3D
            if(u)
            {
                //获取缩放包围盒的示例
                let bb = GeomtryHelper.getBoundingBox(u, 0.8, 1, 0.8)
                HDDebugTools.drawBoxWireframe(bb, u.name, sc)
            }

            let stick = hn.getChildByName('stick') as Laya.MeshSprite3D
            this.stick1_ = Laya.MeshSprite3D.instantiate(stick) as Laya.MeshSprite3D
            this.stick2_ = Laya.MeshSprite3D.instantiate(stick) as Laya.MeshSprite3D

            sc.addChild(this.stick1_)
            sc.addChild(this.stick2_)

            for(let i = 0; i < 8; ++i)
                this.rocks_[i] = hn.getChildByName('rock' + (i + 1)) as Laya.MeshSprite3D
            this.float_ = hn.getChildByName('blue_float') as Laya.MeshSprite3D
        }

        let beach = sc.getChildByName('beach')
        if(beach)
            this.sea_ = beach.getChildByName('sea') as Laya.MeshSprite3D

        Laya.stage.addChild(this.owner)
        Laya.stage.setChildIndex(this.owner, 0)
    }

    enterHome()
    {
        this.bHome_ = true

        Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this._onTouchBegin)
        Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this._onTouchMove)
        Laya.stage.on(Laya.Event.MOUSE_UP, this, this._onTouchEnd)

        AudioMgr.instance.playMusic(BgmType.kBgmMenu)
    }

    enterGame()
    {
        this.bHome_ = false

        if(this.cam_)
        {
            this.cam_.transform.localRotationEulerX = -90
            this.cam_.transform.localPositionY = 3
            this.cam_.transform.localPositionX = -0.5

            for(let i = 0; i < this.rocks_.length; ++i)
            {
                let r = GeomtryHelper.convertBound2RectXZ(this.rocks_[i])
                HDDebugTools.drawRectXZWireframe(r, this.rocks_[i].name, this.owner as Laya.Scene3D, Laya.Color.MAGENTA)

                this.circles_[i] = GeomtryHelper.convertBound2CircleXZ(this.rocks_[i], 1)
                this.circles_[i].tag = this.rocks_[i].name + '_c'
            }
        }
    }

    leaveHome()
    {
        
    }

    leaveGame()
    {
        
    }

    onUpdate()
    {   
        if(this.bHome_)
        {
            let dt = Laya.timer.delta / 1000

            //刷新包围盒绘制的示例
            if(this.tree_)
            {
                this.treeSclTimer_ += dt

                let mul = MathHelper.clamp(1 + Math.cos(this.treeSclTimer_), 0.3, 1.2)
                this.tree_.transform.localScaleY = mul

                this.tree_.transform.localPositionZ += Math.cos(this.treeSclTimer_) * 0.01

                HDDebugTools.drawBoxWireframe(this.tree_.meshRenderer.bounds, this.tree_.name,
                     this.owner, Laya.Color.RED)
            }
        }
        else
        {
            
        }
    }

    private _onTouchBegin(e: MouseEvent)
    {
        // console.log('_onTouchBegin', Laya.stage.mouseX, Laya.stage.mouseY, e.target)

        //判断是否点了stage，只有点击了stage才执行移动操作
        let t = e.target as any
        if('frameRate' in t)
        {
            if(this.bHome_)
            {
                this.touchPos_.x = Laya.stage.mouseX
                this.touchPos_.y = Laya.stage.mouseY

                this.cam_.viewportPointToRay(this.touchPos_, this.ray_)

                this.cam_.transform.lookAt(this.ray_.direction, new Laya.Vector3(0, 1, 0))
            }
            else
            {
                
            }

            this.bTouched_ = true
        }
    }

    private _onTouchMove(e: MouseEvent)
    {
        if(this.bTouched_)
        {
            if(!this.bHome_)
            {
                this.touchPos_.x = Laya.stage.mouseX
                this.touchPos_.y = Laya.stage.mouseY

                this.cam_.viewportPointToRay(this.touchPos_, this.ray_)

                //-----------生成一条线----------
                let bb = GeomtryHelper.getBoundingBox(this.sea_)
                let interV3 = new Laya.Vector3()
                Laya.CollisionUtils.intersectsRayAndBoxRP(this.ray_, bb._boundBox, interV3)      

                let startPos = new Laya.Vector3(this.float_.transform.position.x, 0, this.float_.transform.position.z)
                let endPos = new Laya.Vector3(interV3.x, 0, interV3.z)
                HDDebugTools.drawLineWireframe(startPos, endPos, 'l1', this.owner as Laya.Scene3D, Laya.Color.BLUE)
                //---------------------------------------

                //--------线与圆的交点判断
                for(let i = 0; i < this.circles_.length; ++i)
                {
                    let pnts = GeomtryHelper.intersectSeg2Circle2D(new Laya.Point(startPos.x, startPos.z), 
                        new Laya.Point(endPos.x, endPos.z), this.circles_[i])

                    if(pnts.length > 0)
                    {
                        console.log('circle inter', this.circles_[i].tag)

                        HDDebugTools.drawCylinderXZ(this.circles_[i].tag, this.circles_[i].radius, 0.01, this.rocks_[i], 0.1)

                        if(pnts.length > 1)
                        {
                            this.stick1_.active = true
                            this.stick2_.active = true

                            this.stick1_.transform.position = new Laya.Vector3(pnts[0].x, 0, pnts[0].y)
                            this.stick2_.transform.position = new Laya.Vector3(pnts[1].x, 0, pnts[1].y)

                            // console.log(this.circles_[i].tag + ' circle inter 2 solutions', pnts[0], pnts[1])

                            break
                        }
                        else
                        {
                            this.stick1_.active = true
                            this.stick2_.active = false

                            this.stick1_.transform.position = new Laya.Vector3(pnts[0].x, 0, pnts[0].y)

                            // console.log(this.circles_[i].tag + ' circle inter 1 solutions', pnts[0])

                            break
                        }
                    }
                    else
                    {
                        this.stick1_.active = false
                        this.stick2_.active = false

                        HDDebugTools.hidePrimitive(this.circles_[i].tag)
                    }
                }

                //--------线与矩形的交点判断---------
                for(let i = 0; i < this.rocks_.length; ++i)
                {
                    let rect = GeomtryHelper.convertBound2RectXZ(this.rocks_[i])
                    let interPnts = GeomtryHelper.intersectSeg2Rect2D(
                        new Laya.Point(startPos.x, startPos.z), new Laya.Point(endPos.x, endPos.z), rect)

                    let interArr: SegInterResult[] = []
                    for(let i = 0; i < interPnts.length; ++i)
                    {
                        let inter = interPnts[i]

                        interArr.push(inter)
                    }

                    //如果有多个交点，查找最近的一个
                    let nearInter: SegInterResult = null
                    if(interArr.length > 0)
                    {
                        if(interArr.length > 1)
                        {
                            let dist = 0
                            for(let i = 0; i < interArr.length; ++i)
                            {
                                let d = interArr[i].point.distance(startPos.x, startPos.z)
                                if(d < dist || dist === 0)
                                {
                                    nearInter = interArr[i]
                                    dist = d
                                }
                            }
                        }
                        else
                        {
                            nearInter = interArr[0]
                        }
                    }

                    //有最近的一个交点，开始基于交点生成反射线
                    if(nearInter)
                    {
                        let line = new Laya.Vector3(nearInter.vertex2.x - nearInter.vertex1.x, 0,
                            nearInter.vertex2.y - nearInter.vertex1.y)

                        let rx = 0
                        let ry = 0

                        //与x轴的单位向量平行，入射线反转z
                        if(GeomtryHelper.isParallelVec3D(line, this.horVecN_))
                        {
                            // let dotProd = Laya.Vector3.dot(incoming, this.verVecN_) * 2
                            // let scl = new Laya.Vector3()
                            // Laya.Vector3.scale(this.verVecN_, dotProd, scl)
                            // Laya.Vector3.subtract(incoming, scl, this.reflectLine_)

                            rx = 2 * nearInter.point.x - startPos.x
                            ry = startPos.z
                        }
                        else //假设所有的线都是互相垂直的关系，如果不是横向平行就是纵向平行
                        {
                            rx = startPos.x
                            ry = 2 * nearInter.point.y - startPos.z

                            // let dotProd = Laya.Vector3.dot(incoming, this.horVecN_) * 2
                            // let scl = new Laya.Vector3()
                            // Laya.Vector3.scale(this.horVecN_, dotProd, scl)
                            // Laya.Vector3.subtract(incoming, scl, this.reflectLine_)
                        }

                        this.reflectLine_.setValue(rx - nearInter.point.x, 0, ry - nearInter.point.y)
                        Laya.Vector3.normalize(this.reflectLine_, this.reflectLine_)
                        Laya.Vector3.scale(this.reflectLine_, 0.3, this.reflectLine_)

                        let s = new Laya.Vector3(nearInter.point.x, 0, nearInter.point.y)
                        let e = new Laya.Vector3(rx, 0, ry)
                        // console.log('start pos', startPos, 'inter pos', s, 'end pos', e)
                        HDDebugTools.drawLineWireframe(s, e, this.rocks_[i].name + 'l2', this.owner as Laya.Scene3D, Laya.Color.RED)
                    }
                    else
                    {
                        HDDebugTools.hideWireframe(this.rocks_[i].name + 'l2')
                    }
                }
            }
        }
    }

    private _onTouchEnd(e: MouseEvent)
    {
        this.bTouched_ = false


    }
}

