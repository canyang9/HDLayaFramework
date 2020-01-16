import { G } from "./global_def";
import { GameStorage, SaveDef } from "./Storage";
import { HDMap } from "./structure/hd_map";
import { TimedTaskMgr } from "./timed_task";
import { WxUtil } from "./wx_util";
import { ResManager } from "./res_mgr";
import { GameEventMgrInst, EventType } from "./event_mgr";

//Bgm类型枚举，除了kNone字段外必须与kBgms数组中的元素一一对应
export enum BgmType {
    kBgmMenu,
    kNone = 9999
}

const kBgms = [
    'bgm_menu',
]

//Sfx类型枚举，除了kNone字段外必须与kSfxSet数组中的元素一一对应
export enum SfxType {
    kGoodClick,
    kLuckyBox,
    kNone = 9999
}

const kSfxSet = [
    'goodClick',
    'luckybox',
]

//用于管理音频操作的类，是一个单例，可以直接在各处进行调用
export class AudioMgr {
    public static instance: AudioMgr = new AudioMgr()

    private bMuteMusic_ = false;
    private bMuteSound_ = false;

    private curBgmType_ = BgmType.kNone

    private bgmId_ = 0

    private maxBgmVol_ = 1
    private maxSfxVol_ = 1

    private maxFadeVol_ = 0

    private bgms_: HDMap = new HDMap()
    private sfxMap_: HDMap = new HDMap()

    private fadeTimeTaskId_ = 0

    isStopMusic()
    {
        return this.bMuteMusic_;
    }

    isStopSound()
    {
        return this.bMuteSound_;
    }

    init () 
    {
        Laya.SoundManager.autoReleaseSound = false

        GameEventMgrInst.addListener(EventType.kAudioPause, this.pauseMusic.bind(this), true)
        GameEventMgrInst.addListener(EventType.kAudioResume, this.resumeMusic.bind(this), true)

        this._readData()
    }

    start () 
    {
        
    }

    //设置是否禁止播放bgm
    public setIfMuteMusic(bVal: boolean)
    {
        let bMute = this.bMuteMusic_
        this.bMuteMusic_ = bVal
        if(bVal)
        {
            if(G.isWeChat)
            {
                this.pauseMusic()
            }
            else
                Laya.SoundManager.stopMusic()
        }
        else
        {
            if(G.isWeChat)
            {
                this.resumeMusic()
            }
            else
                Laya.SoundManager.playMusic(this.bgms_.get(this.curBgmType_), 1)
        }

        if(bMute != bVal)
            this._saveData()
    }

    //设置是否禁止播放音效
    public setIfMuteSound(bVal: boolean)
    {
        let bMute = this.bMuteSound_
        this.bMuteSound_ = bVal

        if(bVal)
            Laya.SoundManager.stopAllSound()

        if(bMute != bVal)
            this._saveData()
    }

    //设置背景音乐音量
    public setBgmVolume(val: number)
    {
        this.maxBgmVol_ = val
        Laya.SoundManager.setMusicVolume(val)

        if(val != this.maxBgmVol_)
            this._saveData()
    }

    //设置音效音量
    public setSfxVolume(val: number)
    {
        this.maxSfxVol_ = val
        Laya.SoundManager.setSoundVolume(val)

        if(val != this.maxSfxVol_)
            this._saveData()
    }

    private _saveData()
    {
        let sav = {
            bMuteBgm: this.bMuteMusic_,
            bMuteSfx: this.bMuteSound_,
            maxBgmVol: this.maxBgmVol_,
            maxSfxVol: this.maxSfxVol_
        }

        GameStorage.writeJSON(SaveDef.kAudio, sav)
    }

    private _readData()
    {
        let sav = GameStorage.readJSON(SaveDef.kAudio)
        if(G.isExistObj(sav))
        {
            this.bMuteMusic_ = sav.bMuteBgm
            this.bMuteSound_ = sav.bMuteSfx
            this.maxBgmVol_ = sav.maxBgmVol
            this.maxSfxVol_ = sav.maxSfxVol
        }
        else
            this._saveData()

        this.setBgmVolume(this.maxBgmVol_)
        this.setSfxVolume(this.maxSfxVol_)
    }

    /**
     * 播放bgm
     * @param type 背景音乐类型 
     * @param callback 播放完毕回调，可选，如果存在播放完毕回调，则bgm仅播放一遍， 不会无限循环
     */
    public playMusic(type: BgmType, callback?: Function)
    {
        if(type !== BgmType.kNone && kBgms[type])
        {
            Laya.SoundManager.stopMusic()

            this.curBgmType_ = type

            let name = ''
            if(this.bgms_.containsKey(type))
                name = this.bgms_.get(type)
            else
            {
                name = ResManager.nativePath + 'audio/' + kBgms[type] + '.mp3'
                this.bgms_.put(type, name)
            }
            
            let loop = callback ? 1 : 0

            let handle = null
            if(callback)
                handle = Laya.Handler.create(this, this._loadBgm, [ type, callback ])

            if(!this.bMuteMusic_)
            {
                if(G.isWeChat)
                {
                    WxUtil.playAudio(name, true)
                    if(callback)
                        WxUtil.addAudioCallback(name, handle)
                }
                else
                    Laya.SoundManager.playMusic(name, loop, handle)
            }
        }
        else
        {
            G.log("can't find Bgm", type)
        }
    }

    private _loadBgm(type: BgmType, callback?: Function)
    {
        if(callback)
            callback(type)
    }

    public resumeMusic()
    {
        if(!this.bMuteMusic_)
        {
            if(G.isWeChat)
            {
                let name = this.bgms_.get(this.curBgmType_)
                if(name)
                    WxUtil.resumeAudio(name)
            }
            else
                Laya.SoundManager.setMusicVolume(this.maxBgmVol_)
        }
    }

    public pauseMusic()
    {
        if(G.isWeChat)
        {
            let name = this.bgms_.get(this.curBgmType_)
            if(name)
                WxUtil.pauseAudio(name)
        }
        else
            Laya.SoundManager.setMusicVolume(0)
    }

    public stopEffects()
    {
        Laya.SoundManager.stopAllSound()
    }

    public stopMusic()
    {
        if(G.isWeChat)
        {
            let name = this.bgms_.get(this.curBgmType_)
            if(name)
                WxUtil.stopAudio(name)
        }
        else
            Laya.SoundManager.stopMusic()
    }

    public replayMusic()
    {
        if(this.curBgmType_ && this.bgms_.containsKey(this.curBgmType_))
        {
            if(G.isWeChat)
            {
                let name = this.bgms_.get(this.curBgmType_)
                if(name)
                    WxUtil.playAudio(name, true)
            }
            else
            {
                Laya.SoundManager.stopMusic()
                Laya.SoundManager.playMusic(this.bgms_.get(this.curBgmType_), 1);
            }
        }
    }

    //通过淡入淡出的方式改变bgm，使用前必须要预加载好指定的bgm
    /**
     * 
     * @param t 下一首bgm的类型
     * @param fadeDura 淡入淡出总耗时，会被淡入淡出两个步骤平分，默认为1s，则意味着0.5s淡出旧bgm，0.5s淡入新bgm
     */
    public changeBgmWithFade(t: BgmType, fadeDura = 1)
    {
        TimedTaskMgr.instance.remove(this.fadeTimeTaskId_)

        if(this.maxFadeVol_ > 0)
            this.maxBgmVol_ = this.maxFadeVol_

        this.maxFadeVol_ = this.maxBgmVol_
        let maxBgmVol = this.maxBgmVol_
        let interval = fadeDura / 10
        let fadeSpd = this.maxFadeVol_ / 10 * 2
        let bPlayed = false
        
        this.fadeTimeTaskId_ = TimedTaskMgr.instance.add(()=> {
            if(this.maxBgmVol_ > 0 && !bPlayed)
            {
                this.maxBgmVol_ -= fadeSpd
                if(this.maxBgmVol_ <= 0)
                {
                    this.maxBgmVol_ = 0
                    this.playMusic(t)
                    bPlayed = true
                }
            }
            else
            {
                this.maxBgmVol_ += fadeSpd
                if(this.maxBgmVol_ >= maxBgmVol)
                {
                    this.maxBgmVol_ = maxBgmVol
                }
            }

            G.log(this.maxBgmVol_)
            this.setBgmVolume(this.maxBgmVol_)

        }, 0, 10, interval)
    }

    /**
     * 播放音效
     * @param type 音效类型 
     * @param callback 播放完毕回调，可选参数，接受一个参数type，只有非循环播放的音效才有回调
     * @param bLoop 是否循环播放，默认否
     */
    public playSound(type: SfxType, callback?: Function, bLoop = false)
    {
        if(type !== SfxType.kNone && kSfxSet[type])
        {
            let handle = null
            if(callback && !bLoop)
                handle = Laya.Handler.create(this, this._loadSfx, [ type, callback ])

            let name = ''
            if(this.sfxMap_.containsKey(type))
                name = this.sfxMap_.get(type)
            else
            {
                name = ResManager.nativePath + 'audio/' + kSfxSet[type] + '.mp3'
                this.sfxMap_.put(type, name)
            }

            let loop = bLoop ? 0 : 1

            if(!this.bMuteSound_)
                Laya.SoundManager.playSound(name, loop, handle)
        }
        else
            G.log("can't find Sfx", type)
    }

    private _loadSfx(type: BgmType, callback?: Function)
    {
        if(callback)
            callback(type)
    }
}

export const AudioMgrInst = AudioMgr.instance