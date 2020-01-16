import { HDMap } from "./structure/hd_map";
import { G } from "./global_def";

//资源加载释放管理器
    
export class ResManager {
    public static instance: ResManager = new ResManager()

    public static nativePath = 'res/'

    private sceneMap_: HDMap = new HDMap() //.ls
    private sprite3DMap_: HDMap = new HDMap() //.lh
    private meshMap_: HDMap = new HDMap() //mesh .lm
    private skinMeshMap_: HDMap = new HDMap() //skin mesh .lm
    private matMap_: HDMap = new HDMap() //material .lmat
    private texMap_: HDMap = new HDMap() //texture .png or .jpg
    private animMap_: HDMap = new HDMap() //animation clip .lani

    private lockedMap_: HDMap = new HDMap() //locked res collection

    /**
     * 异步加载ls文件
     * @param file 文件名，确保在bin目录下，需要传入ls后缀的文件
     * @param callback 加载后回调，可选参数，接收一个Laya.Scene3D的参数
     */
    loadScene(file: string, callback?: Function)
    {
        Laya.Scene3D.load(file, Laya.Handler.create(this, (scene: Laya.Scene3D)=>{
            if(scene)
            {
                this.sceneMap_.put(file, scene)

                if(callback)
                    callback(scene)
            }
            else
                G.log('[ResManager] loadScene failed', 2)
        }))
    }

    getScene(file: string): Laya.Scene3D
    {
        let ret = null

        if(this.sceneMap_.containsKey(file))
            ret = this.sceneMap_.get(file)

        return ret
    }

    //包含的mesh,材质等资源并不会真正释放，注意回收
    releaseScene(file: string)
    {
        let sc = this.getScene(file)
        if(sc)
        {
            sc.destroy()
            sc = null
            this.sceneMap_.remove(file)
        }
    }

    /**
     * 异步加载预设文件
     * @param file 文件名，文件确保在bin目录下，需要传入lh后缀的文件
     * @param callback 加载后回调，可选参数，接收一个Laya.Sprite3D参数
     */
    loadSprite3D(file: string, callback?: Function)
    {
        Laya.Sprite3D.load(file, Laya.Handler.create(this, (sp3d: Laya.Sprite3D)=>{
            if(sp3d)
            {
                this.sprite3DMap_.put(file, sp3d)

                if(callback)
                    callback(sp3d)
            }
            else
                G.log('[ResManager] loadSprite3D failed', 2)
        }))
    }

    getSprite3D(file: string): Laya.Sprite3D
    {
        let ret = null

        if(this.sprite3DMap_.containsKey(file))
            ret = this.sprite3DMap_.get(file)

        return ret
    }

    //包含的mesh,材质等资源并不会真正释放，注意回收
    releaseSprite3D(file: string)
    {
        let sp = this.getSprite3D(file)
        if(sp)
        {
            sp.destroy()
            sp = null

            this.sprite3DMap_.remove(file)
        }
    }

    /**
     * 异步加载材质.lmat文件
     * @param file 材质文件名，文件确保在bin目录下，需要传入lmat后缀的文件
     * @param callback 加载后回调，可选参数，接收一个Laya.BaseMaterial参数
     */
    loadMaterial(file: string, callback?: Function)
    {
        Laya.BaseMaterial.load(file, Laya.Handler.create(this, (mat: Laya.BaseMaterial)=>{
            if(mat)
            {
                this.matMap_.put(file, mat)

                if(callback)
                    callback(mat)
            }
            else
                G.log('[ResManager] loadMaterial failed', 2)
        }))
    }

    getMaterial(file: string): Laya.BaseMaterial
    {
        let ret = null

        if(this.matMap_.containsKey(file))
            ret = this.matMap_.get(file)

        return ret
    }

    releaseMaterial(file: string)
    {
        let mat = this.getMaterial(file)
        if(mat)
        {
            mat.destroy()
            mat = null

            this.matMap_.remove(file)
        }
    }

    /**
     * 异步加载纹理
     * @param file 纹理文件名，文件确保在bin目录下，需要传入.png或者.jpg后缀的文件
     * @param callback 加载后回调，可选参数，接收一个Laya.Texture2D参数
     */
    loadTexture(file: string, callback?: Function)
    {
        Laya.Texture2D.load(file, Laya.Handler.create(this, (tex: Laya.Texture2D)=>{
            if(tex)
            {
                this.texMap_.put(file, tex)

                if(callback)
                    callback(tex)
            }
            else
                G.log('[ResManager] loadTexture failed', 2)
        }))
    }

    getTexture(file: string): Laya.Texture2D
    {
        let ret = null

        if(this.texMap_.containsKey(file))
            ret = this.texMap_.get(file)

        return ret
    }

    //TODO: 需要设置好引用计数，真正做到释放
    releaseTexture(file: string)
    {
        let tex = this.getTexture(file)
        if(tex)
        {
            tex.destroy()
            tex = null

            this.texMap_.remove(file)
        }
    }
    
    /**
     * 异步加载模型网格lm
     * @param file 模型文件名，文件确保在bin目录下，需要传入lm后缀的文件
     * @param callback 加载完成后回调，可选参数，接收一个MeshSpriteD、SkinnedMeshSprite3D或Mesh参数
     * @param t 类型，1为MeshSpriteD 2为SkinnedMeshSprite3D 3为纯mesh
     */
    loadMesh(file: string, callback?: Function, t = 1)
    {
        Laya.Mesh.load(file, Laya.Handler.create(this, (m)=>{
            if(m)
            {
                let mesh = null
                if(t === 1)
                {
                    mesh = new Laya.MeshSprite3D(m)

                    this.meshMap_.put(file, mesh)
                }
                else if(t === 2)
                {
                    mesh = new Laya.SkinnedMeshSprite3D(m)

                    this.skinMeshMap_.put(file, mesh)
                }
                else if(t === 3)
                {
                    mesh = m
                }

                if(callback)
                    callback(mesh)
            }
            else
                G.log('[ResManager] loadMesh failed', 2)
        }))
    }

    getMesh(file: string): Laya.MeshSprite3D
    {
        let ret = null

        if(this.meshMap_.containsKey(file))
            ret = this.meshMap_.get(file)

        return ret
    }

    releaseMesh(file: string)
    {
        let m = this.getMesh(file)
        if(m)
        {
            m.destroy()
            m = null

            this.meshMap_.remove(file)
        }
    }

    getSkinMesh(file: string): Laya.SkinnedMeshSprite3D
    {
        let ret = null

        if(this.skinMeshMap_.containsKey(file))
            ret = this.skinMeshMap_.get(file)

        return ret
    }

    releaseSkinMesh(file: string)
    {
        let sm = this.getSkinMesh(file)
        if(sm)
        {
            sm.destroy()
            sm = null

            this.skinMeshMap_.remove(file)
        }
    }

    /**
     * 异步加载动画文件
     * @param file 动画文件名，文件确保在bin目录下，需要传入.lani后缀的文件
     * @param callback 加载完成后回调，可选参数，接收一个Laya.AnimationClip参数
     */
    loadAnim(file: string, callback?: Function)
    {
        Laya.AnimationClip.load(file, Laya.Handler.create(this, (anim: Laya.AnimationClip)=>{
            if(anim)
            {
                this.animMap_.put(file, anim)

                if(callback)
                    callback(anim)
            }
            else
                G.log('[ResManager] loadAnim failed', 2, file)
        }))
    }

    getAnim(file: string): Laya.AnimationClip
    {
        let ret = null

        if(this.animMap_.containsKey(file))
            ret = this.animMap_.get(file)

        return ret
    }

    releaseAnim(file: string)
    {
        let anim = this.getAnim(file)
        if(anim)
        {
            anim.destroy()
            anim = null

            this.animMap_.remove(file)
        }
    }

    /**
     * 批量预加载资源
     * @param files 需要预加载的资源文件名数组，确保在bin目录下，需要注意的是，对于.lm文件，由于无法预知
     * 是MeshSpriteD还是SkinnedMeshSprite3D，故有如下约定，当文件名中包含' skin_ '前缀时，会当做SkinnedMeshSprite3D
     * 缓存，否则均当做MeshSpriteD缓存
     * @param callback 单个资源加载完毕后的回调，每个文件加载完后都会调用一次，通常用于做进度统计，接受文件名的传入
     * 
     * 例：
     * let files = [ "res/role/warrior.lh", "res/weapon/sword.lh", "res/model/rock.lm", "res/texture/rock1.png" ]
     * ResManager.instance.batchPreload(files)
     */
    batchPreload(files: string[], callback?: Function)
    {
        Laya.loader.create(files, Laya.Handler.create(this, this._preloaded, [ files, callback ]))
    }

    private _preloaded(files: string[], callback?: Function)
    {
        for(let i = 0; i < files.length; ++i)
        {
            let res = Laya.loader.getRes(files[i])
            if(res)
            {
                this._assignFileType(files[i], res)
            }
            else
                G.log('[ResManager] batchPreload failed', 2, files[i])

            if(callback)
                callback(files[i])
        }
    }

    //return 1 .ls 2 .lh 3 .lmat 4 .lm 5 .lani 6 tex
    private _assignFileType(name: string, res: any)
    {
        if(name.lastIndexOf('.ls') !== -1)
            this.sceneMap_.put(name, res)
        else if(name.lastIndexOf('.lh') !== -1)
            this.sprite3DMap_.put(name, res)
        else if(name.lastIndexOf('.lmat') !== -1)
            this.matMap_.put(name, res)
        else if(name.lastIndexOf('.lm') !== -1)
        {
            if(name.indexOf('skin_') === -1)
            {
                let m = new Laya.MeshSprite3D(res)
                this.skinMeshMap_.put(name, m)
            }
            else
            {
                let m = new Laya.SkinnedMeshSprite3D(res)
                this.meshMap_.put(name, m)
            }
        }
        else if(name.lastIndexOf('.lani') !== -1)
            this.animMap_.put(name, res)
        else if(name.lastIndexOf('.png') !== -1 || name.lastIndexOf('.jpg') !== -1)
            this.texMap_.put(name, res)
    }

    /**
     * 给指定路径的资源加锁或者解锁
     * @param file 文件名
     * @param t 资源类型，1 .lmat 2 mesh 3 skin mesh 4 .lani 5 tex
     */
    lockSwitch(file: string, t: number, bLock: boolean)
    {
        if(t === 1)
        {
            let res = this.getMaterial(file)
            if(res)
            {
                res.lock = bLock
            }
            else
                G.log('[ResManager] lock failed', 2, file)
        }
        else if(t === 2)
        {
            let res = this.getMesh(file)
            if(res)
            {
                res.meshFilter.sharedMesh.lock = bLock
            }
            else
                G.log('[ResManager] lock failed', 2, file)
        }
        else if(t === 3)
        {
            let res = this.getSkinMesh(file)
            if(res)
            {
                res.meshFilter.sharedMesh.lock = bLock
            }
            else
                G.log('[ResManager] lock failed', 2, file)
        }
        else if(t === 4)
        {
            let res = this.getAnim(file)
            if(res)
            {
                res.lock = bLock
            }
            else
                G.log('[ResManager] lock failed', 2, file)
        }
        else if(t === 5)
        {
            let res = this.getTexture(file)
            if(res)
            {
                res.lock = bLock
            }
            else
                G.log('[ResManager] lock failed', 2, file)
        }
    }

    //释放掉所有没有使用且没有上锁的资源
    //注意Scene3D，Sprite3D调用destroy()方法的，必须是所有对象，包括本体与克隆体
    //对于资源加锁与释放锁的管理，需要使用lockSwitch接口进行
    clearUnused()
    {
        Laya.Resource.destroyUnusedResources()
    }
}
