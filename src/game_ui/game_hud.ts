

import { G } from "../util/global_def";
import { HomeHUD } from "./home_hud";
import { ResManager } from "../util/res_mgr";

export class GameHUD extends Laya.Script {
    static instance: GameHUD = null //由于部分实体与UI数据交互密切，采用全局化的模式访问更为便捷

    onAwake()
    {
        GameHUD.instance = this

        fgui.UIPackage.loadPackage(ResManager.nativePath + "2d/fgui/GameHUD", G.layaHandler(this, this._onLoadedUI))

        // this.scaleX_ = Laya.Browser.width / Laya.stage.designWidth
        // this.scaleY_ = Laya.Browser.height / Laya.stage.designHeight
    }

    open()
    {
        this._enter()
    }

    onDestroy()
    {
        GameHUD.instance = null
    }

    update(dt)
    {
        
    }

    private _onLoadedUI()
    {
        let fguiNode = fgui.GRoot.inst
        
        // fguiNode.setSize(Laya.Browser.width, Laya.Browser.height)

        let fguiUP = fgui.UIPackage
        fguiUP.addPackage(ResManager.nativePath + "2d/fgui/GameHUD")
        

    }

    private _enter()
    {
        
    }

    private _leave()
    {
        
    }
}
