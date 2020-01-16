
import { ResManager } from "../util/res_mgr";
import { TimedTaskMgr } from "../util/timed_task";
import { G } from "../util/global_def";
import { GameUserInfo } from "../game/user_info";
import { DataHub } from "../data/data_hub";
import { WxUtil } from "../util/wx_util";
import { GameEventMgr, EventType } from "../util/event_mgr";
import { GameLogic } from "../game_logic";
import { GameHUD } from "./game_hud";
import { SettingUI, VFXLevel } from "./common/setting_ui";
import { SignInUI } from "./common/sign_in_ui";
import { TransUI } from "./common/trans_ui";
import { TipUI } from "./common/tip_ui";
import { AudioMgr, BgmType } from "../util/audio_mgr";
import { Stage } from "../game/stage";
import { HDBannerAd, HDVideoAd } from "../util/ad_tools";

enum BtnType {
    kStart,
    kSignIn,
    kSetting,
    kBox
}

//这里都是一些样例代码，请在自己项目中根据需求改写或者移除掉
export class HomeHUD extends Laya.Script {
    static instance: HomeHUD = null

    private homePnl_: FGUICom = null

    private startBtn_: FGUIButton = null
    private signInBtn_: FGUIButton = null
    private settingBtn_: FGUIButton = null
    private boxBtn_: FGUIButton = null

    private showTrans_: FGUITrans = null
    private closeTrans_: FGUITrans = null

    private settingUI_: SettingUI = null
    private signInUI_: SignInUI = null

    private stage_: Stage = null

    private bLocked_ = false
    private bFirst_ = false

    private bPreloadBnr_ = false

    onAwake()
    {   
        HomeHUD.instance = this

        fgui.UIPackage.loadPackage(ResManager.nativePath + "2d/fgui/HomeHUD", 
            G.layaHandler(this, this._onLoadedUI))
    }

    onDestroy()
    {

    }

    open()
    {
        this._enter()
    }

    onUpdate()
    {
        
    }

    setStartBtnStatus(bTry = false)
    {
        if(this.startBtn_)
        {
            this.startBtn_.getController('try').selectedIndex = bTry ? 0 : 1
        }
    }

    //样例代码，初始化首页UI以及预加载banner
    private _onLoadedUI()
    {
        let fguiNode = fgui.GRoot.inst

        let fguiUP = fgui.UIPackage
        fguiUP.addPackage(ResManager.nativePath + "2d/fgui/HomeHUD")
        this.homePnl_ = fguiUP.createObject('HomeHUD', 'HomePnl').asCom
        this.homePnl_.setSize(Laya.stage.width, Laya.stage.height)

        if(this.homePnl_)
        {
            fguiNode.addChild(this.homePnl_)
            this.homePnl_.visible = false

            this.startBtn_ = this.homePnl_.getChild('startBtn').asButton
            this.signInBtn_ = this.homePnl_.getChild('signInBtn').asButton
            this.settingBtn_ = this.homePnl_.getChild('settingBtn').asButton
            this.boxBtn_ = this.homePnl_.getChild('freeBoxBtn').asButton

            this.startBtn_.onClick(this, this._onClick, [ BtnType.kStart ])
            this.signInBtn_.onClick(this, this._onClick, [ BtnType.kSignIn ])
            this.settingBtn_.onClick(this, this._onClick, [ BtnType.kSetting ])
            this.boxBtn_.onClick(this, this._onClick, [ BtnType.kBox ])

            this.showTrans_ = this.homePnl_.getTransition('showTrans')
            this.closeTrans_ = this.homePnl_.getTransition('closeTrans')

            this.settingUI_ = SettingUI.instance

            this.signInUI_ = new SignInUI()
            this.signInUI_.init(this.homePnl_.getChild('signInPnl').asCom)
        }
    }

    private _loadedBnr()
    {
        let sc = ResManager.instance.getScene(ResManager.nativePath + '3d/Stage.ls')
        if(sc)
        {
            sc.addComponent(Stage)
            let com = sc.getComponent(Stage) as Stage
            com.init()

            this.stage_ = com

            this._enter()
        }
    }

    private _enter()
    {
        if(this.homePnl_ && this.stage_)
        {
            TransUI.instance.over(0, ()=>{
                this.owner.active = true

                this.homePnl_.visible = true

                this.bPreloadBnr_ = false

                this.stage_.enterHome()
            })
        }
    }

    private _leave()
    {
        this.homePnl_.visible = false
    }

    private _onClick(t: BtnType)
    {
        if(this.bLocked_)
            return

        switch(t) {
            case BtnType.kStart:
                let cb = ()=>{
                    this.stage_.enterGame()

                    this._leave()
                }

                break

            case BtnType.kSignIn:
                if(this.signInUI_)
                    this.signInUI_.show()

                break

            case BtnType.kSetting:
                if(this.settingUI_)
                    this.settingUI_.show()

                break
        }
    }

    private _redPoint(sender, data)
    {
        if(data)
        {
            if(data.type === 1) //签到
                this.signInBtn_.getController('redPnt').selectedIndex = 1
        }
    }

    //根据平均fps结果自动调节特效
    private _fpsResult()
    {
        if(this.settingUI_)
        {
            let avgFps = GameLogic.instance.averageFPS
            G.log('average FPS', avgFps)

            if(avgFps > 0)
            {
                let lv = this.settingUI_.VFXLvl

                let bShow = false
                if(lv == VFXLevel.kHigh)
                {
                    if(avgFps <= 52)
                    {
                        this.settingUI_.VFXLvl = VFXLevel.kMid
                        bShow = true
                    }
                    else if(avgFps <= 45)
                    {
                        this.settingUI_.VFXLvl = VFXLevel.kLow
                        bShow = true
                    }
                }
                else if(lv == VFXLevel.kMid)
                {
                    if(avgFps <= 55)
                    {
                        this.settingUI_.VFXLvl = VFXLevel.kLow
                        bShow = true
                    }
                    else if(avgFps >= 60)
                    {
                        this.settingUI_.VFXLvl = VFXLevel.kHigh
                    }
                }
                else if(lv == VFXLevel.kLow)
                {
                    if(avgFps >= 58)
                    {
                        this.settingUI_.VFXLvl = VFXLevel.kMid
                    }
                }

                // bShow = true

                // if(bShow)
                // {
                //     DialogUI.instance.show('性能提示', '检测到当前特效等级下\n游戏过程中出现卡顿\n' +
                //         '已自动将特效等级降低\n以保障游戏体验\n您随时可以在设置中调节', null, null, true)
                // }
            }
        }
    }

    private _showPageBnr()
    {

    }

    private _hidePageBnr()
    {

    }

    private _showFoldBnr()
    {

    }

    private _hideFoldBnr()
    {

    }
}
