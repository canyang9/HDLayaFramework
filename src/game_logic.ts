//游戏逻辑调度，作为一个整个游戏生命周期都存在的单例，可以完成很多单一实例的转接工作

import { G } from "./util/global_def";
import { GameStorage, SaveDef } from "./Util/Storage";
import { GameEventMgr } from "./util/event_mgr";
import { AudioMgr } from "./util/audio_mgr";
import { TimedTaskMgr } from "./util/timed_task";
import { HDSDK } from "./HDSDK";
import { ResManager } from "./util/res_mgr";
import { GameUserInfo } from "./game/user_info";
import { DataHub } from "./data/data_hub";
import { WxUtil } from "./util/wx_util";
import { GameSetting } from "./game_setting";

const kUnionID = false

export class GameLogic {
    public static instance = new GameLogic()

    private gameEvtMgr_: GameEventMgr = null
    private timedTaskMgr_: TimedTaskMgr = null

    private fpsSum_ = 0
    private frames_ = 0
    private bRecDt_ = false

    bLogined = false //是否已经登录，无论失败还是成功会置为true

    init () 
    {
        Laya.stage.frameRate = GameSetting.framerate === 60 ? 
            Laya.Stage.FRAME_FAST : Laya.Stage.FRAME_SLOW

        if(this.gameEvtMgr_ == null)
            this.gameEvtMgr_ = GameEventMgr.instance
        this.gameEvtMgr_.init()

        if(this.timedTaskMgr_ == null)
            this.timedTaskMgr_ = TimedTaskMgr.instance
        this.timedTaskMgr_.clear()

        AudioMgr.instance.init()

        if(GameSetting.debug == 1)
            GameStorage.clearAllStorage()

        this.loadData()
        
        if(G.isWeChat)
        {
            let sucCb = this._loginSucc.bind(this)
            let failCb = this._loginFail.bind(this)
            let errCb = this._loginError.bind(this)

            if(GameSetting.openId && GameSetting.openId != '' && GameSetting.openId != 'null' &&
                GameSetting.payment === 0)
            {
                this._loginSucc(null)
            }
            else
            {
                if(!kUnionID)
                    WxUtil.login(sucCb, failCb, errCb, true)
            }

            //自行填写主动转发的必要参数
            let forwardCb = function() {
                let msg = DataHub.getMessage

                return {
                    title: msg.title,
                    imageUrl: msg.img,
                    query: '',
                }
            }.bind(this)

            WxUtil.showForward(forwardCb)

            //由于来电话或者虚拟按键切后台等原因导致的音频播放被关闭，使用此方法恢复
            wx.onAudioInterruptionEnd(()=>{
                AudioMgr.instance.stopEffects()
                AudioMgr.instance.resumeMusic()
            })
        }
        else
        {
            this.bLogined = true
            HDSDK.init(GameSetting.openId, GameSetting.proName)
        }

        this._onShow()
        this._onHide()
    }

    start () 
    {
        
    }

    log()
    {
        
    }

    loadData()
    {
        this.readData()
        WxUtil.readData()

        GameUserInfo.read()
    }

    saveData()
    {
        let sav = {
            
        }

        GameStorage.writeJSON(SaveDef.kGameData, sav)
    }

    private readData()
    {
        let sav = GameStorage.readJSON(SaveDef.kGameData)
        if(G.isExistObj(sav))
        {
            
        }
        else
        {
            
        }
    }

    get eventManager()
    {
        return this.gameEvtMgr_
    }

    //跳转场景处理，可传入进度回调以及加载后回调
    /**
     * 
     * @param scene 要跳转的场景名
     * @param lauchedCb 场景跳转完毕后的回调
     */
    changeScene(scene: string, lauchedCb?: Function)
    {
        GameEventMgr.instance.clear()
        TimedTaskMgr.instance.clear()

        ResManager.instance.loadScene(scene, ()=>{
            if(lauchedCb)
                lauchedCb()

            Laya.Resource.destroyUnusedResources()
        })

        if(G.isWeChat)
            wx.triggerGC()
    }

    clear()
    {
        GameEventMgr.instance.clear()
        TimedTaskMgr.instance.clear()

        Laya.Resource.destroyUnusedResources()

        if(G.isWeChat)
            wx.triggerGC()
    }

    recordFPS(bVal: boolean)
    {
        if(bVal)
        {
            this.fpsSum_ = 0
            this.frames_ = 0
        }

        this.bRecDt_ = bVal
    }

    get averageFPS()
    {
        let ret = 0
        if(this.frames_ > 0)
            ret = Math.floor((this.fpsSum_ / this.frames_))
        return ret
    }

    update () 
    {
        let dt = Laya.timer.delta / 1000

        if(this.gameEvtMgr_)
            this.gameEvtMgr_.excuteEvents()
        
        if(this.timedTaskMgr_)
            this.timedTaskMgr_.excuteTasks(dt)
        
        if(this.bRecDt_)
        {
            if(dt > 0)
            {
                let f = 1 / dt
                if(f > 60)
                    f = 60
                this.fpsSum_ += f

                // G.log('fps rec', 1 / dt)
            }
            ++this.frames_
        }
    }

    private _loginSucc(res)
    {
        if(res)
        {
            GameSetting.openId = res.openId
            GameSetting.sessionKey = res.sessionKey

            console.log('login succ cb', res)
        }
        else
            console.log('no login succ cb')

        if(GameSetting.openId && GameSetting.openId != '' && GameSetting.openId != 'null' &&
            GameSetting.payment === 0)
        {
            WxUtil.saveData()
        }

        HDSDK.init(GameSetting.openId, GameSetting.proName)

        WxUtil.launchQueryCheck(kUnionID)

        this.bLogined = true

        // HttpRequest.getUserId(GameSetting.openId, '', (dat) => {
        //     if(dat && dat.res)
        //         this.gameId = dat.res
    
        //     console.log('statistic getUserId', this.gameId, dat)
        // })

        // console.log('login succ cb', res)
    }

    private _loginFail(res)
    {
        GameSetting.sessionKey = ''

        this.bLogined = true

        console.log('login fail cb', res)
    }

    private _loginError(res)
    {
        this.bLogined = true
    }

    private _onShow()
    {
        if(G.isWeChat)
        {
            wx.onShow((res)=> {
                    
                AudioMgr.instance.stopEffects()
                AudioMgr.instance.resumeMusic()

                G.log('onShow')

                let inviteCb = function(res) {
                    G.log('on show invite cb', res)

                }.bind(this)

                WxUtil.onShowQueryCheck(res.query, kUnionID)

                Laya.stage.renderingEnabled = true
                Laya.timer.resume()

                GameUserInfo.calOfflineTime()

                // console.log('resume')
            })
        }
        else
        {

        }
    }

    private _onHide()
    {
        if(G.isWeChat)
        {
            wx.onHide((res)=> {
                Laya.stage.renderingEnabled = false
                Laya.timer.pause()
                
                AudioMgr.instance.pauseMusic()
                AudioMgr.instance.stopEffects()

                GameUserInfo.setOfflineTimestamp()
                GameUserInfo.saveSignIn()

                // console.log('pause')
            })
        }
        else
        {

        }
    }
}
