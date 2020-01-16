
//震动效果

import { G } from "../global_def";

export enum ShakeType {
    kDirX, //x轴上随机震动
    kDirXReg,    //x轴上规律震动
    kDirY,   //y轴上随机震动
    kDirYReg,    //y轴上规律震动
    kDirZ, //z轴上随机震动
    kDirZReg, //z轴上规律震动
    kDirXY, //xy上随机震动
    kDirXYReg, //xy上规则震动
    kDirXZ, //xz上随机震动
    kDirXZReg, //xz上规则震动
    kDirYZ, //yz上随机震动
    kDirYZReg, //yz上规则震动
    kRand   //全随机震动
}

export class Shaker3D {
    private minRange_: number = 0 //shaking strength,used to calculate the min offset for the shaked object

    private maxRange_: number = 0 //shaking strength,used to calculate the max offset for the shaked object

    private attenuation_: number = 0 //the attenuation while shaking,it will influence the shaking strength

    //attenuation frequence,the unit is second,i.e atteFreq_ = 0.1 attenuation_ = 0.5, minRange = 1 and maxRange = 2,
    //then the minRange and maxRange will attenuation to 0.5 and 1.5 after 0.1 sec.That's minRange -= attenuation_ and maxRange -= attenuation_
    private atteFreq_: number = 0 

    private atteFreqVar_: number = 0 //attenuation frequence varing value

    private atteFreqVarF_: number = 0 //attenuation frequence varing frequence,the unit is second

    private freq_: number = 0 //shaking frequence

    private freqVar_: number = 0 //shaking frequence varing value

    private freqVarF_: number = 0 //shaking frequence varing frequance,the unit is second

    private dura_: number = 0 //shaking duration

    private type_: number = 0 

    private shakeDura_: number = 0

    private shakeTimer_: number = 0
    private atteTimer_: number = 0
    private atteFvTimer_: number = 0
    private freqFvTimer_: number = 0

    //param copies,for revert to the orignal values
    private attenuationCp_: number = 0
    private atteFreqCp_: number = 0

    private minRangeCp_: number = 0
    private maxRangeCp_: number = 0
    private freqCp_: number = 0

    private xSign_: number = 0
    private ySign_: number = 0
    private zSign_: number = 0

    private origPosX_: number[] = []
    private origPosY_: number[] = []
    private origPosZ_: number[] = []

    private nodes_: Laya.Sprite3D[] = null

    private callback_: Function = null
    private cbParams_: object = null

    private bRun_: boolean = false

    //初始化震动基础参数
    /**
     * 
     * @param node 需要被震动影响的节点集合
     * @param minRange 最小震动幅度
     * @param maxRange 最大震动幅度
     * @param freq 震动频率，单位s
     * @param dura 震动持续时间，单位s
     * @param type 震动类型
     
        let shaker = new Shaker()
        shaker.init([ this.node ], 1, 3, 0.1, 0.5, ShakeType.kHor)
     */
    init(node: Laya.Sprite3D[], minRange: number, maxRange: number, freq: number, dura: number, 
        type: ShakeType = ShakeType.kRand)
    {   
        this.nodes_ = node

        this.minRange_ = minRange
        this.maxRange_ = maxRange
        this.freq_ = freq
        this.dura_ = dura

        this.type_ = type

        this.minRangeCp_ = minRange
        this.maxRangeCp_ = maxRange
        this.freqCp_ = freq

        for(let i = 0; i < this.nodes_.length; ++i)
        {
            this.origPosX_[i] = this.nodes_[i].transform.localPositionX
            this.origPosY_[i] = this.nodes_[i].transform.localPositionY
            this.origPosZ_[i] = this.nodes_[i].transform.localPositionZ
        }
    }

    //追加衰减参数
    /**
     * 
     * @param attenuation 衰减值，每次触发衰减时震动幅度将会减去相应的衰减值（负衰减即相当于增幅）
     * @param atteFreq 衰减频率
     * @param atteFreqVar 衰减频率变动值，每次触发衰减频率变动时会改变衰减频率的值（增大或减小衰减频率）
     * @param atteFreqVarF 衰减频率变动频率，用于触发衰减频率的变动
     *
        let shaker = new Shaker()
        shaker.init([ this.node ], 1, 3, 0.1, 0.5, ShakeType.kHor)
        shaker.appendAttenuation(0.1, 0.1, 0.02, 0.05)
     */
    appendAttenuation(attenuation: number, atteFreq: number, 
        atteFreqVar: number = 0, atteFreqVarF: number = 0)
    {
        this.attenuation_ = attenuation
        this.atteFreq_ = atteFreq
        this.atteFreqVar_ = atteFreqVar
        this.atteFreqVarF_ = atteFreqVarF

        this.attenuationCp_ = attenuation
        this.atteFreqCp_ = atteFreq
    }

    //追加震动频率变化参数
    /**
     * 
     * @param freqV 频率变量
     * @param fraqVF 变频频率，用于触发频率的变化
     * 
        let shaker = new Shaker()
        shaker.init([ this.node ], 1, 3, 0.1, 0.5, ShakeType.kHor)
        shaker.appendAttenuation(0.1, 0.1, 0.02, 0.05)
        shaker.appendFreqVariable(0.2, 0.1)
     */
    appendFreqVariable(freqV: number, fraqVF: number)
    {
        this.freqVar_ = freqV
        this.freqVarF_ = fraqVF
    }

    //追加震动结束回调函数
    /**
     * 
     * @param cb 回调函数
     * @param params 回调函数参数，默认为空
     
        let shaker = new Shaker()
        shaker.init([ this.node ], 1, 3, 0.1, 0.5, ShakeType.kHor)
        shaker.appendAttenuation(0.1, 0.1, 0.02, 0.05)
        shaker.appendFreqVariable(0.2, 0.1)
        shaker.appendOverCallback(funcntion() { //dosomething })
     */
    appendOverCallback(cb: Function, params: object = null)
    {
        this.callback_ = cb
        this.cbParams_ = params
    }

    //触发震动
    shake()
    {
        if(G.isExistObj(this.nodes_))
        {
            this.bRun_ = true
            this.shakeDura_ = 0

            this.xSign_ = 0
            this.ySign_ = 0

            this.attenuation_ = this.attenuationCp_
            this.atteFreq_ = this.atteFreqCp_

            this.minRange_ = this.minRangeCp_
            this.maxRange_ = this.maxRangeCp_
            this.freq_ = this.freqCp_

            this.shakeTimer_ = 0
            this.atteFvTimer_ = 0
            this.atteTimer_ = 0
            this.freqFvTimer_ = 0

            for(let i = 0; i < this.nodes_.length; ++i)
            {
                this.nodes_[i].transform.localPositionX = this.origPosX_[i]
                this.nodes_[i].transform.localPositionY = this.origPosY_[i]
                this.nodes_[i].transform.localPositionZ = this.origPosZ_[i]
            }
        }
        else
            G.log("[Shaker shake func] - There's no valid node specified", 3)
    }

    stop()
    {
        this.shake() //reset

        this.bRun_ = false
    }

    //更新震动
    update(dt)
    {
        if(this.bRun_)
        {
            this.shakeDura_ += dt
            if(this.shakeDura_ >= this.dura_)
            {
                for(let i = 0; i < this.nodes_.length; ++i)
                {
                    this.nodes_[i].transform.localPositionX = this.origPosX_[i]
                    this.nodes_[i].transform.localPositionY = this.origPosY_[i]
                    this.nodes_[i].transform.localPositionZ = this.origPosZ_[i]
                }

                if(this.callback_)
                    this.callback_(this.cbParams_)

                this.bRun_ = false
                return
            }

            this.shakeTimer_ -= dt
            if(this.shakeTimer_ <= 0)
            {
                this.shakeTimer_ = this.freq_
                
                let vals = this._calOffset()
                for(let i = 0; i < this.nodes_.length; ++i)
                {
                    this.nodes_[i].transform.localPositionX = this.origPosX_[i] + vals.x
                    this.nodes_[i].transform.localPositionY = this.origPosY_[i] + vals.y
                    this.nodes_[i].transform.localPositionZ = this.origPosZ_[i] + vals.z
                }
            }

            if(this.freqVar_ != 0)
            {
                this.freqFvTimer_ -= dt
                if(this.freqFvTimer_ <= 0)
                {
                    this.freqFvTimer_ = this.freqVarF_

                    this.freq_ += this.freqVar_
                }
            }

            if(this.attenuation_ != 0)
            {
                this.atteTimer_ -= dt
                if(this.atteTimer_ <= 0)
                {
                    this.atteTimer_ = this.atteFreq_

                    this.minRange_ -= this.attenuation_
                    if(this.minRange_ <= 0)
                        this.minRange_ = 0

                    this.maxRange_ -= this.attenuation_
                    if(this.maxRange_ <= 0)
                        this.maxRange_ = 0
                }

                if(this.atteFreqVar_ != 0)
                {
                    this.atteFvTimer_ -= dt
                    if(this.atteFvTimer_ <= 0)
                    {
                        this.atteFvTimer_ = this.atteFreqVarF_

                        this.atteFreq_ += this.atteFreqVar_
                    }
                }
            }
        }
    }

    private _calOffset(): { x: number, y: number, z: number }
    {
        let ret = { x: 0, y: 0, z: 0 }

        let offsetX = 0
        let offsetY = 0
        let offsetZ = 0

        if(this.type_ == ShakeType.kDirX || this.type_ == ShakeType.kDirXY || this.type_ == ShakeType.kDirXZ)
        {
            offsetX = G.randRangeF(this.minRange_, this.maxRange_)
            if(G.randRangeF(1, 100) > 50)
                offsetX = -offsetX
        }
        else if(this.type_ == ShakeType.kDirXReg || this.type_ == ShakeType.kDirXYReg || this.type_ == ShakeType.kDirXZReg)
        {
            offsetX = G.randRangeF(this.minRange_, this.maxRange_) * this.xSign_
            if(this.xSign_ == 0)
            {
                if(G.randRangeF(1, 100) > 50)
                    this.xSign_ = 1
                else
                    this.xSign_ = -1
            }
            else
                this.xSign_ = -this.xSign_
        }
        
        if(this.type_ == ShakeType.kDirY || this.type_ == ShakeType.kDirXY || this.type_ == ShakeType.kDirYZ)
        {
            offsetY = G.randRangeF(this.minRange_, this.maxRange_)
            if(G.randRangeF(1, 100) > 50)
                offsetY = -offsetY
        }
        else if(this.type_ == ShakeType.kDirYReg || this.type_ == ShakeType.kDirXYReg || this.type_ == ShakeType.kDirYZReg)
        {
            offsetY = G.randRangeF(this.minRange_, this.maxRange_) * this.ySign_
            if(this.ySign_ == 0)
            {
                if(G.randRangeF(1, 100) > 50)
                    this.ySign_ = 1
                else
                    this.ySign_ = -1
            }
            else
                this.ySign_ = -this.ySign_
        }
        
        if(this.type_ == ShakeType.kDirZ || this.type_ == ShakeType.kDirXZ || this.type_ == ShakeType.kDirYZ)
        {
            offsetZ = G.randRangeF(this.minRange_, this.maxRange_)
            if(G.randRangeF(1, 100) > 50)
                offsetZ = -offsetZ
        }
        else if(this.type_ == ShakeType.kDirZReg || this.type_ == ShakeType.kDirXZReg || this.type_ == ShakeType.kDirYZReg)
        {
            offsetZ = G.randRangeF(this.minRange_, this.maxRange_) * this.zSign_
            if(this.zSign_ == 0)
            {
                if(G.randRangeF(1, 100) > 50)
                    this.zSign_ = 1
                else
                    this.zSign_ = -1
            }
            else
                this.zSign_ = -this.zSign_
        }

        if(this.type_ == ShakeType.kRand)
        {
            offsetX = G.randRangeF(this.minRange_, this.maxRange_)
            if(G.randRangeF(1, 100) > 50)
                offsetX = -offsetX

            offsetY = G.randRangeF(this.minRange_, this.maxRange_)
            if(G.randRangeF(1, 100) > 50)
                offsetY = -offsetY

            offsetZ = G.randRangeF(this.minRange_, this.maxRange_)
            if(G.randRangeF(1, 100) > 50)
                offsetZ = -offsetZ
        }

        ret = { x: offsetX, y: offsetY, z: offsetZ }

        return ret
    }
}
