//本地数据存储接口

import { G } from "./global_def";

export class SaveDef {
    static kGameData = 'gameDat'
    static kSetting = 'setting'
    static kAudio = 'audio'
    static kWxStatus = 'wxStatus'
    static kPlayer = 'player'
    static kDaily = 'signIn'
    static kVersion = 'ver'
    static kForceNav = 'nav'
}

export class GameStorage {
    public static clearAllStorage()
    {
        Laya.LocalStorage.clear()
    }

    public static writeBoolean(key: string, bVal: boolean)
    {
        let val = bVal ? 1 : 0
        Laya.LocalStorage.setItem(key, val.toString())
    }

    //如果不存在合法的值，则返回null
    public static readBoolean(key: string)
    {
        let bRet = null
        
        let v = Laya.LocalStorage.getItem(key)
        if(v != null && v !== '')
        {
            let val = parseInt(v)
            
            if(val === 0)
                bRet = false
            else if(val != null && !isNaN(val))
                bRet = val == 1 ? true : false
        }

        return bRet 
    }

    public static writeNum(key: string, val: number)
    {
        Laya.LocalStorage.setItem(key, val.toString())
    }

    //不存在合法的值，返回null
    public static readNum(key: string): number
    {
        let ret = null

        let v = Laya.LocalStorage.getItem(key)
        if(v != null && v !== '')
        {
            let val = parseFloat(v)

            if(!isNaN(val))
            {
                ret = val
            }
        }

        return ret
    }

    public static writeJSON(key: string, val: any)
    {
        let v = JSON.stringify(val)
        Laya.LocalStorage.setItem(key, v)
    }

    public static readJSON(key: string): any
    {
        let ret = null

        let v = Laya.LocalStorage.getItem(key)
        if(v)
            ret = JSON.parse(v)

        return ret
    }

    public static remove(key: string)
    {
        Laya.LocalStorage.removeItem(key)
    }
}
