
import { G } from "./util/global_def";
import { AudioMgr, BgmType } from "./util/audio_mgr";
import { ResManager } from "./util/res_mgr";
import { DataHub } from "./data/data_hub";
import { GameStorage, SaveDef } from "./util/Storage";
import { BaseUI } from "./game_ui/common/base_ui";
import { InputBlocker } from "./game_ui/common/blocker_ui";
import { TipUI } from "./game_ui/common/tip_ui";
import { PopupUI } from "./game_ui/common/popup_ui";
import { DialogUI } from "./game_ui/common/dialog_ui";
import { SettingUI } from "./game_ui/common/setting_ui";
import { TransUI } from "./game_ui/common/trans_ui";
import { GameLogic } from "./game_logic";
import { HDBannerAd } from "./util/ad_tools";
import { WxUtil } from "./util/wx_util";

export class Load extends Laya.Script {
    private loadPnl_: FGUICom = null
    private loadProg_: FGUIProgress = null
    private loadBg_: FGUIImage = null

    private loadProc_ = 0
    private loadTimer_ = 0

    private bLoading_ = false
    private bLoaded_ = false

    private bExcuted_ = false
    private bChanged_ = false

    onStart() {
        GameLogic.instance.init()

        Laya.timer.frameLoop(1, GameLogic.instance, GameLogic.instance.update)

        DataHub.loadJson()

        BaseUI.root = fgui.GRoot.inst
        
        Laya.stage.addChild(BaseUI.root.displayObject)
        fgui.UIConfig.packageFileExtension = "bin"

        fgui.UIPackage.loadPackage(ResManager.nativePath + "LoadUI", G.layaHandler(this, this._onLoadingUI))
    }

    private _onLoadingUI()
    {
        fgui.UIPackage.addPackage(ResManager.nativePath + "LoadUI")

        this.loadPnl_ = fgui.UIPackage.createObject('LoadUI', 'Loading').asCom
        if(this.loadPnl_)
        {
            BaseUI.root.addChild(this.loadPnl_)

            this.loadPnl_.setSize(Laya.stage.width, Laya.stage.height)

            this.loadBg_ = this.loadPnl_.getChild('bg').asImage
            this.loadProg_ = this.loadPnl_.getChild('prog').asProgress

            let bw = this.loadBg_.width
            let bh = this.loadBg_.height

            let sh = Laya.stage.height / bh
            let sv = Laya.stage.width / bw

            if(sh > sv)
            {
                this.loadBg_.width = bw * sh
                this.loadBg_.height = bh * sh
            }
            else
            {
                this.loadBg_.width = bw * sv
                this.loadBg_.height = bh * sv
            }

            G.log('loading UI size', this.loadBg_.width, this.loadBg_.height, bw, bh, sh, sv)
        }

        if (G.isWeChat) {
            //初始化微信工具集并检查是否有版本更新，版本更新的提示要做到完善
            WxUtil.fetchSdkInfo()
            WxUtil.checkVersionUpdate(this._updateApp.bind(this), this._noUpdate.bind(this))
        }

        this.bLoading_ = true
        this.loadProc_ = 0
    }

    private _updateApp() {

    }

    private _noUpdate() {
       
    }

    private _excuteLoad() {
        ResManager.nativePath = 'res/'

        this.bLoaded_ = true
        this._addProc(99)
    }

    onUpdate() {
        if(this.bLoading_) //假进度
        {
            if(this.loadProc_ < 40)
            {
                let dt = Laya.timer.delta / 1000
                this.loadTimer_ -= dt
                if(this.loadTimer_ <= 0)
                {
                    this._addProc(G.randRange(10, 15))
                    this.loadTimer_ = G.randRangeF(0.1, 0.3)
                }
            }
            else if(this.loadProc_ < 89)
            {
                if(!this.bExcuted_)
                {
                    this._excuteLoad()
                    this.bExcuted_ = true
                }
                else
                {
                    if(this.loadProc_ < 88)
                        this._addProc(1)
                }
            }
            else
            {
                if (this.bLoaded_ && !this.bChanged_ && DataHub.bJsonLoaded && GameLogic.instance.bLogined) {
                    fgui.UIPackage.loadPackage(ResManager.nativePath + "2d/fgui/CommUI", 
                        G.layaHandler(this, this._onLoadCommUI))
        
                    this.bChanged_ = true
                }
            }
        }
    }

    private _onLoadCommUI() 
    {
        DataHub.loadBackendConfig()

        fgui.UIPackage.addPackage(ResManager.nativePath + "2d/fgui/CommUI")

        let blocker = fgui.UIPackage.createObject('CommUI', 'Blocker').asCom
        if (blocker)
            InputBlocker.instance.init(blocker)

        let tip = fgui.UIPackage.createObject('CommUI', 'Tip').asCom
        if(tip)
            TipUI.instance.init(tip)

        let popup = fgui.UIPackage.createObject('CommUI', 'Popup').asCom
        if(popup)
            PopupUI.instance.init(popup)

        let dialog = fgui.UIPackage.createObject('CommUI', 'DialogPnl').asCom
        if(dialog)
            DialogUI.instance.init(dialog)

        let setting = fgui.UIPackage.createObject('CommUI', 'SettingPnl').asCom
        if(setting)
            SettingUI.instance.init(setting)

        let trans = fgui.UIPackage.createObject('CommUI', 'TransPnl').asCom
        if(trans)
            TransUI.instance.init(trans)

        this._addProc(0, true)

        BaseUI.root.removeChild(this.loadPnl_)
        this.loadPnl_.dispose()

        fgui.UIPackage.removePackage("LoadUI")

        TransUI.instance.show(()=>{
            Laya.Scene.open('HomeHUD.scene', true)
        })
    }

    private _addProc(val: number, bFinished = false)
    {
        if(bFinished)
        {
            this.loadProc_ = 100
        }
        else
        {
            this.loadProc_ += val
            if(this.loadProc_ > 99)
            {
                this.loadProc_ = 99
            }
        }

        this.loadProg_.value = this.loadProc_
    }
}
