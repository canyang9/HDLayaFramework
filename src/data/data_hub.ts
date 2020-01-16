
import { G } from "../util/global_def";
import { GameSetting } from "../game_setting";
import { BonusData } from "./bonus_data";

export class DataHub {
    static version = '1.0.0'

    static config = { 
        export: 1,  //导出位是否显示 1显示 0不显示
        forceNavProb: 50, //强制导出概率，默认50%
        forceFakePageProb: 0,
        fakeBtnClick: 0,

        directAward: 0, //流量主未开启前，是否玩家允许直接领取视屏奖励
    }

    static message = { sh: [ { title: '分享标题，请自行修改', img: '' } ] }

    static bJsonLoaded = false //json数据是否加载完成，影响Load过程

    /**
     * 随机获取分享信息
     */
    static get getMessage()
    {
        return this.message.sh[G.randRange(0, this.message.sh.length - 1)]
    }

    /**
     * 加载后台分享信息与开关配置
     */
    static loadBackendConfig()
    {
        
    }

    /**
     * 加载游戏json配置
     */
    static loadJson()
    {
        G.readJson('data/testDat', (res)=>{
            BonusData.fetch(res)

            this.bJsonLoaded = true
        });
    }
}