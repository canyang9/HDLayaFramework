
//摇摆效果

import { G } from "../global_def";

export enum SwingType {
    kDirX, //x轴上随机摇摆
    kDirXReg,    //x轴上规律摇摆
    kDirY,   //y轴上随机摇摆
    kDirYReg,    //y轴上规律摇摆
    kDirZ, //z轴上随机摇摆
    kDirZReg, //z轴上规律摇摆
    kDirXY, //xy上随机摇摆
    kDirXYReg, //xy上规则摇摆
    kDirXZ, //xz上随机摇摆
    kDirXZReg, //xz上规则摇摆
    kDirYZ, //yz上随机摇摆
    kDirYZReg, //yz上规则摇摆
    kRand   //全随机摇摆
}

export class Swing3D {
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

    private swingDura_: number = 0

    private swingTimer_: number = 0
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

    private origRotX_: number[] = []
    private origRotY_: number[] = []
    private origRotZ_: number[] = []

    private nodes_: Laya.Sprite3D[] = null

    private callback_: Function = null
    private cbParams_: object = null

    private bRun_: boolean = false

    //初始化摇摆基础参数
    /**
     * 
     * @param node 需要被摇摆影响的节点集合
     * @param minRange 最小摇摆幅度
     * @param maxRange 最大摇摆幅度
     * @param freq 摇摆频率，单位s
     * @param dura 摇摆持续时间，单位s
     * @param type 摇摆类型
     
        let swing = new Swing3D()
        swing.init([ this.node ], 10, 30, 0.1, 0.5, SwingType.kDirX)
     */
    init(node: Laya.Sprite3D[], minRange: number, maxRange: number, freq: number, dura: number, 
        type: SwingType = SwingType.kRand)
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
            this.origRotX_[i] = this.nodes_[i].transform.localRotationEulerX
            this.origRotY_[i] = this.nodes_[i].transform.localRotationEulerY
            this.origRotZ_[i] = this.nodes_[i].transform.localRotationEulerZ
        }
    }

    //追加衰减参数
    /**
     * 
     * @param attenuation 衰减值，每次触发衰减时摇摆幅度将会减去相应的衰减值（负衰减即相当于增幅）
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

    //追加摇摆频率变化参数
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

    //追加摇摆结束回调函数
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

    //触发摇摆
    swing()
    {
        if(G.isExistObj(this.nodes_))
        {
            this.bRun_ = true
            this.swingDura_ = 0

            this.xSign_ = 0
            this.ySign_ = 0

            this.attenuation_ = this.attenuationCp_
            this.atteFreq_ = this.atteFreqCp_

            this.minRange_ = this.minRangeCp_
            this.maxRange_ = this.maxRangeCp_
            this.freq_ = this.freqCp_

            this.swingTimer_ = 0
            this.atteFvTimer_ = 0
            this.atteTimer_ = 0
            this.freqFvTimer_ = 0

            for(let i = 0; i < this.nodes_.length; ++i)
            {
                this.nodes_[i].transform.localRotationEulerX = this.origRotX_[i]
                this.nodes_[i].transform.localRotationEulerY = this.origRotY_[i]
                this.nodes_[i].transform.localRotationEulerZ = this.origRotZ_[i]
            }
        }
        else
            G.log("[Shaker shake func] - There's no valid node specified", 3)
    }

    stop()
    {
        this.swing() //reset

        this.bRun_ = false
    }

    //更新摇摆
    update(dt)
    {
        if(this.bRun_)
        {
            this.swingDura_ += dt
            if(this.swingDura_ >= this.dura_)
            {
                for(let i = 0; i < this.nodes_.length; ++i)
                {
                    this.nodes_[i].transform.localRotationEulerX = this.origRotX_[i]
                    this.nodes_[i].transform.localRotationEulerY = this.origRotY_[i]
                    this.nodes_[i].transform.localRotationEulerZ = this.origRotZ_[i]
                }

                if(this.callback_)
                    this.callback_(this.cbParams_)

                this.bRun_ = false
                return
            }

            this.swingTimer_ -= dt
            if(this.swingTimer_ <= 0)
            {
                this.swingTimer_ = this.freq_
                
                let vals = this._calOffset()
                for(let i = 0; i < this.nodes_.length; ++i)
                {
                    this.nodes_[i].transform.localRotationEulerX = this.origRotX_[i] + vals.x
                    this.nodes_[i].transform.localRotationEulerY = this.origRotY_[i] + vals.y
                    this.nodes_[i].transform.localRotationEulerZ = this.origRotZ_[i] + vals.z
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

        if(this.type_ == SwingType.kDirX || this.type_ == SwingType.kDirXY || this.type_ == SwingType.kDirXZ)
        {
            offsetX = G.randRangeF(this.minRange_, this.maxRange_)
            if(G.randRangeF(1, 100) > 50)
                offsetX = -offsetX
        }
        else if(this.type_ == SwingType.kDirXReg || this.type_ == SwingType.kDirXYReg || this.type_ == SwingType.kDirXZReg)
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
        
        if(this.type_ == SwingType.kDirY || this.type_ == SwingType.kDirXY || this.type_ == SwingType.kDirYZ)
        {
            offsetY = G.randRangeF(this.minRange_, this.maxRange_)
            if(G.randRangeF(1, 100) > 50)
                offsetY = -offsetY
        }
        else if(this.type_ == SwingType.kDirYReg || this.type_ == SwingType.kDirXYReg || this.type_ == SwingType.kDirYZReg)
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
        
        if(this.type_ == SwingType.kDirZ || this.type_ == SwingType.kDirXZ || this.type_ == SwingType.kDirYZ)
        {
            offsetZ = G.randRangeF(this.minRange_, this.maxRange_)
            if(G.randRangeF(1, 100) > 50)
                offsetZ = -offsetZ
        }
        else if(this.type_ == SwingType.kDirZReg || this.type_ == SwingType.kDirXZReg || this.type_ == SwingType.kDirYZReg)
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

        if(this.type_ == SwingType.kRand)
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
