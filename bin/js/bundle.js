(function () {
    'use strict';

    class HDMap {
        constructor() {
            this.keys_ = null;
            this.values_ = null;
            this.keys_ = new Array();
            this.values_ = new Object();
        }
        copy(dat) {
            let keys = dat.keys_;
            let values = dat.values_;
            if (keys) {
                for (let i = 0; i < keys.length; ++i)
                    this.keys_[i] = keys[i];
            }
            if (values) {
                for (let k in values) {
                    if (values.hasOwnProperty(k))
                        this.values_[k] = values[k];
                }
            }
        }
        toString() {
            let str = "{ ";
            for (let i = 0, len = this.keys_.length; i < len; ++i, str += ", ") {
                let key = this.keys_[i];
                let value = this.values_[key];
                str += key + " = " + value;
            }
            str = str.substring(0, str.length - 1);
            str += " }";
            return str;
        }
        size() {
            return this.keys_.length;
        }
        put(key, value) {
            let k = key.toString();
            if (this.values_[k] == null) {
                this.values_[k] = value;
                this.keys_.push(k);
            }
            else
                this.values_[k] = value;
        }
        get(key) {
            let k = key.toString();
            return this.values_[k];
        }
        getFirst() {
            let ret = null;
            let k = this.keys_[0];
            ret = this.values_[k];
            return ret;
        }
        getLast() {
            let ret = null;
            let k = this.keys_[this.keys_.length - 1];
            ret = this.values_[k];
            return ret;
        }
        getByIndex(idx) {
            let ret = null;
            if (idx >= 0 && idx < this.keys_.length) {
                let k = this.keys_[idx];
                ret = this.values_[k];
            }
            return ret;
        }
        remove(key) {
            let k = key.toString();
            let idx = this.indexOf(k);
            if (idx != -1)
                this.keys_.splice(idx, 1);
            this.values_[k] = null;
        }
        clear() {
            for (let i = 0, len = this.keys_.length; i < len; ++i) {
                this.values_[this.keys_[i]] = null;
            }
            this.keys_ = [];
        }
        containsKey(key) {
            let k = key.toString();
            return this.values_[k] != null;
        }
        isEmpty() {
            return this.keys_.length === 0;
        }
        each(cb, para = null) {
            if (cb) {
                for (let i = 0; i < this.keys_.length; ++i) {
                    const key = this.keys_[i];
                    cb(i, key, this.values_[key], para);
                }
            }
        }
        indexOf(key) {
            let ret = -1;
            const size = this.size();
            if (size > 0) {
                let k = key.toString();
                for (let i = 0, len = size; i < len; ++i) {
                    if (this.keys_[i] == k) {
                        ret = i;
                        break;
                    }
                }
            }
            return ret;
        }
        values(start = 0, range = 0) {
            let ret = new Array();
            let cnt = (range > 0 ? Math.min(this.keys_.length, range) : this.keys_.length) + start;
            for (let i = start; i < cnt; ++i) {
                ret.push(this.values_[this.keys_[i]]);
            }
            return ret;
        }
    }

    const kEpsilons = [0.1, 0.01, 0.001, 0.0001, 0.00001, 0.000001];
    class G {
        static isEmptyObj(obj) {
            if (obj) {
                if (typeof obj !== 'object') {
                    return false;
                }
                for (let name in obj) {
                    return false;
                }
            }
            return true;
        }
        static isExistObj(obj) {
            return !this.isEmptyObj(obj);
        }
        static uniqueArray(arr) {
            let res = arr.filter(function (item, index, array) {
                return array.indexOf(item) === index;
            });
            return res;
        }
        static uniqueArrayEx(arr) {
            let obj = {};
            return arr.filter(function (item, index, array) {
                return obj.hasOwnProperty(typeof item + JSON.stringify(item)) ? false : (obj[typeof item + JSON.stringify(item)] = true);
            });
        }
        static clampString(str, maxChars, suffix) {
            suffix = suffix == null ? '...' : suffix;
            maxChars *= 2;
            var codeArr = this._toCodePoint(str);
            var numChar = 0;
            var index = 0;
            for (var i = 0; i < codeArr.length; ++i) {
                var code = codeArr[i].v;
                var add = 1;
                if (code >= 128) {
                    add = 2;
                }
                if (numChar + add > maxChars) {
                    break;
                }
                index = i;
                numChar += add;
            }
            if (codeArr.length - 1 == index) {
                return str;
            }
            var more = suffix ? 1 : 0;
            return str.substring(0, codeArr[index - more].pos + 1) + suffix;
        }
        static isEqualF(a, b, p = 6) {
            let bRet = false;
            let eps = kEpsilons[p - 1] || 0.0001;
            if (Math.abs(a - b) <= eps)
                bRet = true;
            return bRet;
        }
        static randRange(min, max) {
            return Math.round(Math.random() * (max - min)) + min;
        }
        static randRangeF(min, max, decimals = 0) {
            let ret = Math.random() * (max - min) + min;
            if (decimals > 0)
                ret = parseFloat(ret.toFixed(decimals));
            return ret;
        }
        static readJson(filepath, callback) {
            let fp = filepath;
            if (fp.indexOf('.json') !== -1) ;
            else
                fp = filepath + '.json';
            Laya.loader.load(fp, Laya.Handler.create(null, () => {
                let res = Laya.loader.getRes(fp);
                if (callback)
                    callback(res);
                Laya.loader.clearRes(fp);
            }), null, Laya.Loader.JSON);
        }
        static layaHandler(caller, method, args, once = true) {
            return Laya.Handler.create(caller, method, args, once);
        }
        static formatSecond(val, flag = 1) {
            let ret = '';
            if (flag === 1) {
                let m = parseInt((val / 60).toString());
                let s = val % 60;
                ret = m + '分' + s.toFixed(0) + '秒';
            }
            else if (flag === 2) {
                let h = parseInt((val / 3600).toString());
                let mv = val % 3600;
                let m = parseInt((mv / 60).toString());
                let s = mv % 60;
                ret = h + '小时' + m + '分' + s.toFixed(0) + '秒';
            }
            else if (flag === 3) {
                let d = parseInt((val / 86400).toString());
                let hv = val % 86400;
                let h = parseInt((hv / 3600).toString());
                let mv = hv % 3600;
                let m = parseInt((mv / 60).toString());
                let s = mv % 60;
                ret = d + '天' + h + '小时' + m + '分' + s.toFixed(0) + '秒';
            }
            return ret;
        }
        static log(msg, ...optParam) {
            if (optParam && optParam.length > 0) {
                console.log(msg, optParam);
            }
            else {
                console.log(msg);
            }
        }
        static warn(msg, ...optParam) {
            if (optParam && optParam.length > 0) {
                console.warn(msg, optParam);
            }
            else {
                console.warn(msg);
            }
        }
        static error(msg, ...optParam) {
            if (optParam && optParam.length > 0) {
                console.error(msg, optParam);
            }
            else {
                console.error(msg);
            }
        }
        static get isWeChat() {
            return typeof wx !== 'undefined';
        }
        static get isBaidu() {
            return typeof swan !== 'undefined';
        }
        static get isByteDance() {
            return typeof tt !== 'undefined';
        }
    }
    G._toCodePoint = function (unicodeSurrogates) {
        let r = [], c = 0, p = 0, i = 0;
        while (i < unicodeSurrogates.length) {
            let pos = i;
            c = unicodeSurrogates.charCodeAt(i++);
            if (c == 0xfe0f)
                continue;
            if (p) {
                let value = (0x10000 + ((p - 0xD800) << 10) + (c - 0xDC00));
                r.push({
                    v: value,
                    pos: pos,
                });
                p = 0;
            }
            else if (0xD800 <= c && c <= 0xDBFF) {
                p = c;
            }
            else {
                r.push({
                    v: c,
                    pos: pos
                });
            }
        }
        return r;
    };

    class ResManager {
        constructor() {
            this.sceneMap_ = new HDMap();
            this.sprite3DMap_ = new HDMap();
            this.meshMap_ = new HDMap();
            this.skinMeshMap_ = new HDMap();
            this.matMap_ = new HDMap();
            this.texMap_ = new HDMap();
            this.animMap_ = new HDMap();
            this.lockedMap_ = new HDMap();
        }
        loadScene(file, callback) {
            Laya.Scene3D.load(file, Laya.Handler.create(this, (scene) => {
                if (scene) {
                    this.sceneMap_.put(file, scene);
                    if (callback)
                        callback(scene);
                }
                else
                    G.log('[ResManager] loadScene failed', 2);
            }));
        }
        getScene(file) {
            let ret = null;
            if (this.sceneMap_.containsKey(file))
                ret = this.sceneMap_.get(file);
            return ret;
        }
        releaseScene(file) {
            let sc = this.getScene(file);
            if (sc) {
                sc.destroy();
                sc = null;
                this.sceneMap_.remove(file);
            }
        }
        loadSprite3D(file, callback) {
            Laya.Sprite3D.load(file, Laya.Handler.create(this, (sp3d) => {
                if (sp3d) {
                    this.sprite3DMap_.put(file, sp3d);
                    if (callback)
                        callback(sp3d);
                }
                else
                    G.log('[ResManager] loadSprite3D failed', 2);
            }));
        }
        getSprite3D(file) {
            let ret = null;
            if (this.sprite3DMap_.containsKey(file))
                ret = this.sprite3DMap_.get(file);
            return ret;
        }
        releaseSprite3D(file) {
            let sp = this.getSprite3D(file);
            if (sp) {
                sp.destroy();
                sp = null;
                this.sprite3DMap_.remove(file);
            }
        }
        loadMaterial(file, callback) {
            Laya.BaseMaterial.load(file, Laya.Handler.create(this, (mat) => {
                if (mat) {
                    this.matMap_.put(file, mat);
                    if (callback)
                        callback(mat);
                }
                else
                    G.log('[ResManager] loadMaterial failed', 2);
            }));
        }
        getMaterial(file) {
            let ret = null;
            if (this.matMap_.containsKey(file))
                ret = this.matMap_.get(file);
            return ret;
        }
        releaseMaterial(file) {
            let mat = this.getMaterial(file);
            if (mat) {
                mat.destroy();
                mat = null;
                this.matMap_.remove(file);
            }
        }
        loadTexture(file, callback) {
            Laya.Texture2D.load(file, Laya.Handler.create(this, (tex) => {
                if (tex) {
                    this.texMap_.put(file, tex);
                    if (callback)
                        callback(tex);
                }
                else
                    G.log('[ResManager] loadTexture failed', 2);
            }));
        }
        getTexture(file) {
            let ret = null;
            if (this.texMap_.containsKey(file))
                ret = this.texMap_.get(file);
            return ret;
        }
        releaseTexture(file) {
            let tex = this.getTexture(file);
            if (tex) {
                tex.destroy();
                tex = null;
                this.texMap_.remove(file);
            }
        }
        loadMesh(file, callback, t = 1) {
            Laya.Mesh.load(file, Laya.Handler.create(this, (m) => {
                if (m) {
                    let mesh = null;
                    if (t === 1) {
                        mesh = new Laya.MeshSprite3D(m);
                        this.meshMap_.put(file, mesh);
                    }
                    else if (t === 2) {
                        mesh = new Laya.SkinnedMeshSprite3D(m);
                        this.skinMeshMap_.put(file, mesh);
                    }
                    else if (t === 3) {
                        mesh = m;
                    }
                    if (callback)
                        callback(mesh);
                }
                else
                    G.log('[ResManager] loadMesh failed', 2);
            }));
        }
        getMesh(file) {
            let ret = null;
            if (this.meshMap_.containsKey(file))
                ret = this.meshMap_.get(file);
            return ret;
        }
        releaseMesh(file) {
            let m = this.getMesh(file);
            if (m) {
                m.destroy();
                m = null;
                this.meshMap_.remove(file);
            }
        }
        getSkinMesh(file) {
            let ret = null;
            if (this.skinMeshMap_.containsKey(file))
                ret = this.skinMeshMap_.get(file);
            return ret;
        }
        releaseSkinMesh(file) {
            let sm = this.getSkinMesh(file);
            if (sm) {
                sm.destroy();
                sm = null;
                this.skinMeshMap_.remove(file);
            }
        }
        loadAnim(file, callback) {
            Laya.AnimationClip.load(file, Laya.Handler.create(this, (anim) => {
                if (anim) {
                    this.animMap_.put(file, anim);
                    if (callback)
                        callback(anim);
                }
                else
                    G.log('[ResManager] loadAnim failed', 2, file);
            }));
        }
        getAnim(file) {
            let ret = null;
            if (this.animMap_.containsKey(file))
                ret = this.animMap_.get(file);
            return ret;
        }
        releaseAnim(file) {
            let anim = this.getAnim(file);
            if (anim) {
                anim.destroy();
                anim = null;
                this.animMap_.remove(file);
            }
        }
        batchPreload(files, callback) {
            Laya.loader.create(files, Laya.Handler.create(this, this._preloaded, [files, callback]));
        }
        _preloaded(files, callback) {
            for (let i = 0; i < files.length; ++i) {
                let res = Laya.loader.getRes(files[i]);
                if (res) {
                    this._assignFileType(files[i], res);
                }
                else
                    G.log('[ResManager] batchPreload failed', 2, files[i]);
                if (callback)
                    callback(files[i]);
            }
        }
        _assignFileType(name, res) {
            if (name.lastIndexOf('.ls') !== -1)
                this.sceneMap_.put(name, res);
            else if (name.lastIndexOf('.lh') !== -1)
                this.sprite3DMap_.put(name, res);
            else if (name.lastIndexOf('.lmat') !== -1)
                this.matMap_.put(name, res);
            else if (name.lastIndexOf('.lm') !== -1) {
                if (name.indexOf('skin_') === -1) {
                    let m = new Laya.MeshSprite3D(res);
                    this.skinMeshMap_.put(name, m);
                }
                else {
                    let m = new Laya.SkinnedMeshSprite3D(res);
                    this.meshMap_.put(name, m);
                }
            }
            else if (name.lastIndexOf('.lani') !== -1)
                this.animMap_.put(name, res);
            else if (name.lastIndexOf('.png') !== -1 || name.lastIndexOf('.jpg') !== -1)
                this.texMap_.put(name, res);
        }
        lockSwitch(file, t, bLock) {
            if (t === 1) {
                let res = this.getMaterial(file);
                if (res) {
                    res.lock = bLock;
                }
                else
                    G.log('[ResManager] lock failed', 2, file);
            }
            else if (t === 2) {
                let res = this.getMesh(file);
                if (res) {
                    res.meshFilter.sharedMesh.lock = bLock;
                }
                else
                    G.log('[ResManager] lock failed', 2, file);
            }
            else if (t === 3) {
                let res = this.getSkinMesh(file);
                if (res) {
                    res.meshFilter.sharedMesh.lock = bLock;
                }
                else
                    G.log('[ResManager] lock failed', 2, file);
            }
            else if (t === 4) {
                let res = this.getAnim(file);
                if (res) {
                    res.lock = bLock;
                }
                else
                    G.log('[ResManager] lock failed', 2, file);
            }
            else if (t === 5) {
                let res = this.getTexture(file);
                if (res) {
                    res.lock = bLock;
                }
                else
                    G.log('[ResManager] lock failed', 2, file);
            }
        }
        clearUnused() {
            Laya.Resource.destroyUnusedResources();
        }
    }
    ResManager.instance = new ResManager();
    ResManager.nativePath = 'res/';

    class SaveDef {
    }
    SaveDef.kGameData = 'gameDat';
    SaveDef.kSetting = 'setting';
    SaveDef.kAudio = 'audio';
    SaveDef.kWxStatus = 'wxStatus';
    SaveDef.kPlayer = 'player';
    SaveDef.kDaily = 'signIn';
    SaveDef.kVersion = 'ver';
    SaveDef.kForceNav = 'nav';
    class GameStorage {
        static clearAllStorage() {
            Laya.LocalStorage.clear();
        }
        static writeBoolean(key, bVal) {
            let val = bVal ? 1 : 0;
            Laya.LocalStorage.setItem(key, val.toString());
        }
        static readBoolean(key) {
            let bRet = null;
            let v = Laya.LocalStorage.getItem(key);
            if (v != null && v !== '') {
                let val = parseInt(v);
                if (val === 0)
                    bRet = false;
                else if (val != null && !isNaN(val))
                    bRet = val == 1 ? true : false;
            }
            return bRet;
        }
        static writeNum(key, val) {
            Laya.LocalStorage.setItem(key, val.toString());
        }
        static readNum(key) {
            let ret = null;
            let v = Laya.LocalStorage.getItem(key);
            if (v != null && v !== '') {
                let val = parseFloat(v);
                if (!isNaN(val)) {
                    ret = val;
                }
            }
            return ret;
        }
        static writeJSON(key, val) {
            let v = JSON.stringify(val);
            Laya.LocalStorage.setItem(key, v);
        }
        static readJSON(key) {
            let ret = null;
            let v = Laya.LocalStorage.getItem(key);
            if (v)
                ret = JSON.parse(v);
            return ret;
        }
        static remove(key) {
            Laya.LocalStorage.removeItem(key);
        }
    }

    var EventType;
    (function (EventType) {
        EventType[EventType["kNone"] = 0] = "kNone";
        EventType[EventType["kAudioPause"] = 1] = "kAudioPause";
        EventType[EventType["kAudioResume"] = 2] = "kAudioResume";
        EventType[EventType["kBnrAdBrowerSim"] = 3] = "kBnrAdBrowerSim";
        EventType[EventType["kAdjustVfxLv"] = 4] = "kAdjustVfxLv";
        EventType[EventType["kOpenFreeBox"] = 5] = "kOpenFreeBox";
        EventType[EventType["kLeaveHome"] = 6] = "kLeaveHome";
        EventType[EventType["kRedPoint"] = 7] = "kRedPoint";
    })(EventType || (EventType = {}));
    class GameEvent {
        constructor() {
            this.type_ = EventType.kNone;
            this.id_ = 0;
            this.sender_ = null;
            this.data_ = null;
        }
        init(id, t, sender, data) {
            this.id_ = id;
            this.type_ = t;
            this.sender_ = sender;
            this.data_ = data;
        }
        get type() {
            return this.type_;
        }
        get id() {
            return this.id_;
        }
        get sender() {
            return this.sender_;
        }
        get data() {
            return this.data_;
        }
    }
    class GameListener {
        constructor() {
            this.id_ = 0;
            this.callback_ = null;
            this.bExe = false;
        }
        get id() {
            return this.id_;
        }
        init(id, cb) {
            this.id_ = id;
            this.callback_ = cb;
        }
        excute(sender, data) {
            this.bExe = true;
            if (this.callback_)
                this.callback_(sender, data);
            this.bExe = false;
        }
    }
    class GameEventMgr {
        constructor() {
            this.baseEvtId_ = 0;
            this.baseListenerId_ = 0;
            this.listenerMap_ = null;
            this.persistListnerMap_ = null;
            this.delMap_ = new HDMap();
            this.evtLst_ = null;
            this.bExe_ = false;
        }
        init() {
            this.baseEvtId_ = 0;
            this.baseListenerId_ = 0;
            if (this.listenerMap_ == null)
                this.listenerMap_ = new HDMap();
            this.listenerMap_.clear();
            if (this.persistListnerMap_ == null)
                this.persistListnerMap_ = new HDMap();
            this.persistListnerMap_.clear();
            if (this.evtLst_ == null)
                this.evtLst_ = new Array();
            this.evtLst_ = [];
            this.bExe_ = false;
        }
        addEvent(t, sender = null, data = null, bImmediately = true) {
            ++this.baseEvtId_;
            let evt = new GameEvent();
            evt.init(this.baseEvtId_, t, sender, data);
            if (bImmediately) {
                let lst = this.listenerMap_.get(t);
                if (lst != null) {
                    for (let i = 0; i < lst.length; ++i)
                        lst[i].excute(evt.sender, evt.data);
                }
            }
            else {
                this.bExe_ = true;
                this.evtLst_.push(evt);
            }
        }
        addListener(t, cb, bPersist = false) {
            ++this.baseListenerId_;
            let lis = new GameListener();
            lis.init(this.baseListenerId_, cb);
            let lst = null;
            if (this.listenerMap_.containsKey(t)) {
                lst = this.listenerMap_.get(t);
                if (lst != null)
                    lst.push(lis);
            }
            else {
                lst = new Array();
                lst.push(lis);
                this.listenerMap_.put(t, lst);
            }
            if (bPersist && lst) {
                this.persistListnerMap_.put(t, lst);
            }
            return this.baseListenerId_;
        }
        removeListener(t, id) {
            if (this.listenerMap_.containsKey(t)) {
                let lst = this.listenerMap_.get(t);
                if (lst != null) {
                    for (let i = 0; i < lst.length; ++i) {
                        if (!lst[i].bExe && lst[i].id === id) {
                            lst.splice(i, 1);
                            break;
                        }
                        else if (lst[i].bExe) {
                            this.delMap_.put(t, id);
                            this.bExe_ = true;
                        }
                    }
                    if (lst.length == 0) {
                        this.listenerMap_.remove(t);
                        if (this.persistListnerMap_.containsKey(t))
                            this.persistListnerMap_.remove(t);
                    }
                }
            }
        }
        clear() {
            this.evtLst_ = [];
            let delArr = [];
            this.listenerMap_.each((i, k, v) => {
                if (!this.persistListnerMap_.containsKey(k))
                    delArr.push(k);
            });
            for (let i = 0; i < delArr.length; ++i)
                this.listenerMap_.remove(delArr[i]);
            this.delMap_.clear();
        }
        excuteEvents() {
            if (!this.bExe_)
                return;
            for (let i = 0; i < this.evtLst_.length; ++i) {
                let evt = this.evtLst_[i];
                if (evt == null) {
                    G.log('can not find the approriate game event', 3);
                    break;
                }
                let lst = this.listenerMap_.get(evt.type);
                if (lst) {
                    for (let j = 0; j < lst.length; ++j) {
                        lst[j].excute(evt.sender, evt.data);
                    }
                }
                else
                    G.log('Can not find the listeners about event ', 2, evt.type.toString());
            }
            if (this.delMap_.size() > 0) {
                this.delMap_.each((i, k, v) => {
                    this.removeListener(k, v);
                });
                this.delMap_.clear();
            }
            this.evtLst_ = [];
            this.bExe_ = false;
        }
    }
    GameEventMgr.instance = new GameEventMgr();
    const GameEventMgrInst = GameEventMgr.instance;

    class SaveDef$1 {
    }
    SaveDef$1.kGameData = 'gameDat';
    SaveDef$1.kSetting = 'setting';
    SaveDef$1.kAudio = 'audio';
    SaveDef$1.kWxStatus = 'wxStatus';
    SaveDef$1.kPlayer = 'player';
    SaveDef$1.kDaily = 'signIn';
    SaveDef$1.kVersion = 'ver';
    SaveDef$1.kForceNav = 'nav';
    class GameStorage$1 {
        static clearAllStorage() {
            Laya.LocalStorage.clear();
        }
        static writeBoolean(key, bVal) {
            let val = bVal ? 1 : 0;
            Laya.LocalStorage.setItem(key, val.toString());
        }
        static readBoolean(key) {
            let bRet = null;
            let v = Laya.LocalStorage.getItem(key);
            if (v != null && v !== '') {
                let val = parseInt(v);
                if (val === 0)
                    bRet = false;
                else if (val != null && !isNaN(val))
                    bRet = val == 1 ? true : false;
            }
            return bRet;
        }
        static writeNum(key, val) {
            Laya.LocalStorage.setItem(key, val.toString());
        }
        static readNum(key) {
            let ret = null;
            let v = Laya.LocalStorage.getItem(key);
            if (v != null && v !== '') {
                let val = parseFloat(v);
                if (!isNaN(val)) {
                    ret = val;
                }
            }
            return ret;
        }
        static writeJSON(key, val) {
            let v = JSON.stringify(val);
            Laya.LocalStorage.setItem(key, v);
        }
        static readJSON(key) {
            let ret = null;
            let v = Laya.LocalStorage.getItem(key);
            if (v)
                ret = JSON.parse(v);
            return ret;
        }
        static remove(key) {
            Laya.LocalStorage.removeItem(key);
        }
    }

    var TimedTaskType;
    (function (TimedTaskType) {
        TimedTaskType[TimedTaskType["kNone"] = 0] = "kNone";
    })(TimedTaskType || (TimedTaskType = {}));
    const kInfinitedRepeat = -2;
    class TTask {
        constructor() {
            this.id = 0;
            this.type = TimedTaskType.kNone;
            this.callback_ = null;
            this.param_ = null;
            this.timer_ = 0;
            this.repeat_ = 1;
            this.delay_ = 0;
            this.interval_ = 0;
            this.bFrame_ = false;
            this.bPause_ = false;
        }
        set pause(val) {
            this.bPause_ = this.bPause_;
        }
        init(id, cb, delay = 0, repeat = 1, interval = 0, param = null, type = TimedTaskType.kNone, bFrame = false) {
            this.id = id;
            this.callback_ = cb;
            this.repeat_ = repeat < kInfinitedRepeat ? kInfinitedRepeat : repeat;
            this.delay_ = delay;
            this.interval_ = interval;
            this.timer_ = interval;
            this.type = type;
            this.bFrame_ = bFrame;
            this.bPause_ = false;
        }
        excute(dt) {
            if (this.bPause_)
                return;
            let bRet = false;
            if (this.delay_ > 0) {
                if (this.bFrame_)
                    --this.delay_;
                else
                    this.delay_ -= dt;
                return;
            }
            if (this.repeat_ > 0 || this.repeat_ === kInfinitedRepeat) {
                if (this.bFrame_)
                    ++this.timer_;
                else
                    this.timer_ += dt;
                if (this.timer_ >= this.interval_) {
                    if (this.repeat_ > 0)
                        --this.repeat_;
                    if (this.callback_) {
                        this.callback_(this.param_);
                    }
                    this.timer_ = 0;
                }
            }
            else if (this.repeat_ === 0) {
                bRet = true;
            }
            return bRet;
        }
    }
    class TimedTaskMgr {
        constructor() {
            this.baseId_ = 0;
            this.noneTypeMap_ = new HDMap();
            this.specTypeMap_ = new HDMap();
        }
        add(cb, delay = 0, repeat = 1, interval = 0, param = null, type = TimedTaskType.kNone, bFrame = false) {
            ++this.baseId_;
            let t = new TTask();
            t.init(this.baseId_, cb, delay, repeat, interval, param, type, bFrame);
            if (type === TimedTaskType.kNone) {
                this.noneTypeMap_.put(this.baseId_, t);
            }
            else {
                if (this.specTypeMap_.containsKey(t)) {
                    let lst = this.specTypeMap_.get(t);
                    if (lst != null)
                        lst.push(t);
                }
                else {
                    let lst = new Array();
                    lst.push(t);
                    this.specTypeMap_.put(t, lst);
                }
            }
            return this.baseId_;
        }
        addWithFrame(cb, delay = 0, repeat = 1, interval = 0, param = null, type = TimedTaskType.kNone) {
            this.add(cb, delay, repeat, interval, param, type, true);
        }
        pause(bPause, id, t = TimedTaskType.kNone) {
            if (t === TimedTaskType.kNone) {
                if (this.noneTypeMap_.containsKey(id))
                    this.noneTypeMap_.get(id).pause = bPause;
                else
                    console.warn('[TimedTask] not valid id in type <TimedTaskType.kNone>');
            }
            else {
                if (this.specTypeMap_.containsKey(t)) {
                    if (id === -1) {
                        let lst = this.specTypeMap_.get(t);
                        if (lst) {
                            for (let i = 0; i < lst.length; ++i) {
                                lst[i].pause = bPause;
                            }
                        }
                    }
                    else {
                        let lst = this.specTypeMap_.get(t);
                        if (lst != null) {
                            for (let i = 0; i < lst.length; ++i) {
                                if (lst[i].id === id) {
                                    lst[i].pause = bPause;
                                    break;
                                }
                            }
                        }
                    }
                }
                else {
                    console.warn('[TimedTask] not valid type: ', t);
                }
            }
        }
        pauseAll(bPause, excludeIds) {
            this.noneTypeMap_.each((i, k, v) => {
                if (excludeIds) {
                    let bExclude = false;
                    for (let j = 0; j < excludeIds.length; ++j) {
                        if (excludeIds[j] == v.id) {
                            excludeIds.splice(j, 1);
                            bExclude = true;
                            break;
                        }
                    }
                    if (!bExclude)
                        v.pause = bPause;
                }
                else
                    v.pause = bPause;
            });
            this.specTypeMap_.each((i, k, v) => {
                if (excludeIds) {
                    for (let i = 0; i < v.length; ++i) {
                        let bExclude = false;
                        for (let j = 0; j < excludeIds.length; ++j) {
                            if (excludeIds[j] == v[i].id) {
                                excludeIds.splice(j, 1);
                                bExclude = true;
                                break;
                            }
                        }
                        if (!bExclude)
                            v[i].pause = bPause;
                    }
                }
                else {
                    for (let i = 0; i < v.length; ++i) {
                        v[i].pause = bPause;
                    }
                }
            });
        }
        remove(id, t = TimedTaskType.kNone) {
            if (t === TimedTaskType.kNone) {
                if (this.noneTypeMap_.containsKey(id))
                    this.noneTypeMap_.remove(id);
            }
            else {
                if (this.specTypeMap_.containsKey(t)) {
                    if (id === -1) {
                        this.specTypeMap_.remove(t);
                    }
                    else {
                        let lst = this.specTypeMap_.get(t);
                        if (lst != null) {
                            for (let i = 0; i < lst.length; ++i) {
                                if (lst[i].id === id) {
                                    lst.splice(i, 1);
                                    break;
                                }
                            }
                            if (lst.length == 0)
                                this.specTypeMap_.remove(t);
                        }
                    }
                }
                else {
                    console.warn('[TimedTask] not valid type: ', t);
                }
            }
        }
        clear() {
            this.baseId_ = 0;
            this.noneTypeMap_.clear();
            this.specTypeMap_.clear();
        }
        excuteTasks(dt) {
            if (this.noneTypeMap_.size() > 0) {
                let delArr = [];
                this.noneTypeMap_.each((i, k, v) => {
                    if (v.excute(dt)) {
                        delArr.push(v.id);
                    }
                });
                for (let i = 0; i < delArr.length; ++i) {
                    this.remove(delArr[i]);
                }
            }
            if (this.specTypeMap_.size() > 0) {
                let tArr = [];
                let delArr = [];
                this.specTypeMap_.each((i, k, lst) => {
                    if (lst) {
                        tArr.push(k);
                        for (let j = 0; j < lst.length; ++j) {
                            if (lst[j].excute(dt))
                                delArr.push(lst[j].id);
                        }
                    }
                });
                for (let i = 0; i < tArr.length; ++i) {
                    for (let j = 0; j < delArr.length; ++j) {
                        this.remove(delArr[j], tArr[i]);
                    }
                }
            }
        }
    }
    TimedTaskMgr.instance = new TimedTaskMgr();
    const TimedTaskInst = TimedTaskMgr.instance;

    class GameSetting {
    }
    GameSetting.debug = 0;
    GameSetting.testServer = 0;
    GameSetting.framerate = 60;
    GameSetting.payment = 0;
    GameSetting.proName = '';
    GameSetting.openId = '';
    GameSetting.unionId = '';
    GameSetting.sessionKey = '';
    GameSetting.gameId = '';

    const kComLoginDomain = 'https://login.joyfulh.com/comLogin';
    class WxUtil {
        static saveData() {
            let sav = {
                openId: GameSetting.openId,
            };
            GameStorage$1.writeJSON(SaveDef$1.kWxStatus, sav);
        }
        static readData() {
            let sav = GameStorage$1.readJSON(SaveDef$1.kWxStatus);
            if (sav) {
                GameSetting.openId = sav.openId;
            }
        }
        static fetchSdkInfo() {
            this.sdkInfo = wx.getSystemInfoSync();
            console.log('[WxUtil SDK info]', this.sdkInfo.screenWidth, this.sdkInfo.screenHeight, this.sdkInfo.platform, this.sdkInfo.SDKVersion);
        }
        static compareVersionForWx(v1Str, v2Str) {
            let v1 = v1Str.split('.');
            let v2 = v2Str.split('.');
            let len = Math.max(v1.length, v2.length);
            while (v1.length < len) {
                v1.push('0');
            }
            while (v2.length < len) {
                v2.push('0');
            }
            for (let i = 0; i < len; i++) {
                let num1 = parseInt(v1[i]);
                let num2 = parseInt(v2[i]);
                if (num1 > num2) {
                    return 1;
                }
                else if (num1 < num2) {
                    return -1;
                }
            }
            return 0;
        }
        static login(succCb, failCb, errorCb, bForceLogin = false, bUnionID = false) {
            if (bForceLogin) {
                this._login(succCb, failCb, errorCb, bUnionID);
            }
            else {
                wx.checkSession({
                    success: (sessionRes) => {
                        console.log('check session succ', sessionRes);
                        WxUtil.readData();
                    },
                    fail: (sessionRes) => {
                        console.log('check session fail', sessionRes);
                        this._login(succCb, failCb, errorCb, bUnionID);
                    },
                    complete: (sessionRes) => {
                    }
                });
            }
        }
        static _login(succCb, failCb, errorCb, bUnionID = false) {
            wx.login({
                success: (loginRes) => {
                    G.log('login succ', 1, loginRes, bUnionID);
                    if (loginRes.code) {
                        this.loginCode = loginRes.code;
                        if (!bUnionID) {
                            wx.request({
                                url: this.domain_ + '/user/getSessionKey',
                                data: {
                                    code: loginRes.code,
                                    proName: GameSetting.proName,
                                    choose: '1',
                                },
                                header: {
                                    'content-type': 'application/json'
                                },
                                method: 'GET',
                                dataType: 'json',
                                success: (res) => {
                                    if (res.statusCode >= 200 && res.statusCode <= 400) {
                                        console.log('login request succ', res);
                                        if (succCb)
                                            succCb(JSON.parse(res.data.res));
                                    }
                                    else {
                                        console.log('login request fail', res);
                                        if (failCb)
                                            failCb(res);
                                    }
                                },
                                fail: (res) => {
                                    console.log('login request complete fail', res);
                                    if (errorCb)
                                        errorCb(res);
                                },
                            });
                        }
                        else {
                            if (succCb)
                                succCb();
                        }
                    }
                },
                fail: (loginRes) => {
                    console.log('login fail', loginRes);
                    if (errorCb)
                        errorCb(loginRes);
                },
                complete: (loginRes) => {
                }
            });
        }
        static fetchUserInfo(imgUrl, commCb, reqSucCb, reqFailCb, tapCb, btnStyle) {
            if (WxUtil.compareVersionForWx(this.sdkInfo.SDKVersion, '1.2.0') != -1) {
                wx.getSetting({
                    success: (res) => {
                        if (res.authSetting['scope.userInfo']) {
                            wx.getUserInfo({
                                withCredentials: true,
                                lang: 'zh_CN',
                                success: (userRes) => {
                                    if (commCb)
                                        commCb(userRes.userInfo);
                                    this._authLogin(userRes, reqSucCb, reqFailCb);
                                },
                                fail: (res) => {
                                    G.log('get setting scope userInfo failed', 1, res);
                                },
                                complete: (res) => {
                                },
                            });
                        }
                        else {
                            if (WxUtil.compareVersionForWx(this.sdkInfo.SDKVersion, '2.0.1') != -1) {
                                let image = wx.createImage();
                                image.src = 'res/raw-assets/resources/' + imgUrl + '.png';
                                image.onload = function () {
                                    let style = btnStyle;
                                    if (G.isEmptyObj(style)) {
                                        let wid = image.width;
                                        let hgt = image.height;
                                        style = {
                                            left: this.sdkInfo.screenWidth * 0.5 - wid * 0.5,
                                            top: this.sdkInfo.screenHeight * 0.5,
                                            width: wid,
                                            height: hgt,
                                            color: '#ffffff',
                                            lineHeight: 40,
                                            backgroundColor: '#ff0000',
                                            borderColor: '#ffffff',
                                            textAlign: 'center',
                                            fontSize: 16,
                                            borderRadius: 4,
                                        };
                                    }
                                    this._authentication(commCb, style, image.src, tapCb, reqSucCb, reqFailCb);
                                }.bind(this);
                            }
                            else {
                                WxUtil.modalDialog('微信更新提示', '当前微信版本较低，建议升级以保障游戏体验', function () {
                                    wx.exitMiniProgram({});
                                }, null, false);
                            }
                        }
                    },
                    fail: (res) => {
                    },
                    complete: (res) => {
                    }
                });
            }
            else {
                WxUtil.modalDialog('微信更新提示', '当前微信版本过低，请升级已保障正常游戏体验', function () {
                    wx.exitMiniProgram({});
                }, null, false);
            }
        }
        static _authLogin(encryptInfo, sucCb, failCb) {
            wx.request({
                url: this.domain_ + '/user/auth',
                data: {
                    encryptedData: encryptInfo.encryptedData,
                    iv: encryptInfo.iv,
                    code: this.loginCode,
                    proName: GameSetting.proName
                },
                header: {
                    'content-type': 'application/json'
                },
                method: 'GET',
                dataType: 'json',
                success: (res) => {
                    if (res.statusCode >= 200 && res.statusCode <= 400) {
                        console.log('_authLogin request succ', res);
                        if (sucCb)
                            sucCb(res.data.res);
                    }
                    else {
                        console.log('_authLogin request fail', res);
                        if (failCb)
                            failCb();
                    }
                },
                fail: (res) => {
                    console.log('_authLogin request complete fail', res);
                },
            });
        }
        static _authentication(commInfoCb, style, imgUrl, tapCb, sucCb, failCb) {
            let btn = wx.createUserInfoButton({
                type: 'image',
                text: 'txt',
                image: imgUrl,
                style: style,
                withCredentials: true,
                lang: 'zh_CN',
            });
            btn.show();
            G.log('create button', 1, btn);
            let tpCb = function (res) {
                G.log('_authentication onTap', 1, res);
                if (res.iv == null || res.encryptedData == null) {
                    G.log('cancel auth');
                    let image = wx.createImage();
                    image.src = imgUrl;
                    image.onload = function () {
                        let st = style;
                        if (G.isEmptyObj(st)) {
                            let wid = image.width;
                            let hgt = image.height;
                            st = {
                                left: this.sdkInfo.screenWidth * 0.5 - wid * 0.5,
                                top: this.sdkInfo.screenHeight * 0.5,
                                width: wid,
                                height: hgt,
                                color: '#ffffff',
                                lineHeight: 40,
                                backgroundColor: '#ff0000',
                                borderColor: '#ffffff',
                                textAlign: 'center',
                                fontSize: 16,
                                borderRadius: 4,
                            };
                        }
                        this._authentication(commInfoCb, style, image.src, tapCb, sucCb, failCb);
                    }.bind(this);
                }
                else {
                    if (commInfoCb)
                        commInfoCb(res.userInfo);
                    this._authLogin(res, sucCb, failCb);
                    if (tapCb)
                        tapCb();
                }
                btn.offTap(tpCb);
                btn.destroy();
            }.bind(this);
            btn.onTap(tpCb);
        }
        static uploadUserInfo(nickName, avatar, gender, city, province, country) {
            wx.request({
                url: this.domain_ + '/user/updUser',
                data: {
                    proName: GameSetting.proName,
                    openid: GameSetting.openId,
                    unionid: GameSetting.unionId,
                    nickname: nickName,
                    gender: gender,
                    avatarurl: avatar,
                    city: city,
                    province: province,
                    country: country,
                },
                header: {
                    'content-type': 'application/json'
                },
                method: 'GET',
                dataType: 'json',
                success: (res) => {
                },
                fail: (res) => {
                },
            });
        }
        static showForward(callback) {
            wx.showShareMenu({
                withShareTicket: false,
                success: (res) => {
                },
                fail: () => {
                },
                complete: () => {
                },
            });
            wx.onShareAppMessage(function () {
                let ret = null;
                if (callback)
                    ret = callback();
                return ret;
            });
        }
        static launchQueryCheck(bUnionID = false) {
        }
        static onShowQueryCheck(query, bUnionID = false) {
        }
        static reqTimerReset(sysName, choose, succCb) {
            let func = function () {
                wx.request({
                    url: this.domain_ + '/user/reqTimerReset',
                    data: {
                        proName: GameSetting.proName,
                        sysName: sysName,
                        openId: GameSetting.openId,
                        choose: choose.toString()
                    },
                    header: {
                        'content-type': 'application/json'
                    },
                    method: 'GET',
                    dataType: 'json',
                    success: (res) => {
                        if (res.statusCode >= 200 && res.statusCode <= 400) {
                            console.log('reqTimerReset request succ', res);
                            let r = parseInt(res.data.res);
                            if (succCb)
                                succCb(r);
                        }
                        else {
                            console.log('reqTimerReset request fail', res);
                            WxUtil.modalDialog('网络报告', '当前网络环境不佳，请检查网络后重试');
                        }
                    },
                    fail: (res) => {
                        console.log('reqTimerReset request fail', res);
                    },
                });
            }.bind(this);
            if (GameSetting.openId == '') {
                WxUtil.login(function (loginRes) {
                    GameSetting.sessionKey = loginRes.sessionKey;
                    GameSetting.openId = loginRes.openId;
                    func();
                    G.log('reqTimerReset relogin', 1, loginRes);
                }, null, null, true);
            }
            else {
                func();
            }
        }
        static reqTimerResetUnion(sysName, choose, succCb, noUnionIdCb) {
            let func = function () {
                wx.request({
                    url: this.domain_ + '/user/reqTimerResetU',
                    data: {
                        proName: GameSetting.proName,
                        sysName: sysName,
                        unionId: GameSetting.unionId,
                        choose: choose.toString()
                    },
                    header: {
                        'content-type': 'application/json'
                    },
                    method: 'GET',
                    dataType: 'json',
                    success: (res) => {
                        if (res.statusCode >= 200 && res.statusCode <= 400) {
                            console.log('reqTimerResetUnion request succ', res);
                            let r = parseInt(res.data.res);
                            if (succCb)
                                succCb(r);
                        }
                        else {
                            console.log('reqTimerResetUnion request fail', res);
                        }
                    },
                    fail: (res) => {
                        console.log('reqTimerResetUnion request complete fail', res);
                    },
                });
            }.bind(this);
            if (GameSetting.unionId == '') {
                if (noUnionIdCb)
                    noUnionIdCb();
            }
            else {
                func();
            }
        }
        static watchVideoAds(unitID, closeCbSuc, closeCbFail, errCb, createCb) {
            let info = WxUtil.sdkInfo;
            if (WxUtil.compareVersionForWx(info.SDKVersion, '2.1.0') != -1) {
                let closeCB = function (res) {
                    if (WxUtil.videoAdsProtectFlags_.containsKey(unitID)) {
                        let v = WxUtil.videoAdsProtectFlags_.get(unitID);
                        if (v === 1)
                            return;
                    }
                    console.log('Ads Close callback', res.isEnded);
                    GameEventMgrInst.addEvent(EventType.kAudioResume);
                    if (res && res.isEnded || res === undefined) {
                        if (closeCbSuc)
                            closeCbSuc();
                        WxUtil.videoAdsProtectFlags_.put(unitID, 1);
                    }
                    else {
                        if (closeCbFail)
                            closeCbFail();
                        WxUtil.videoAdsProtectFlags_.put(unitID, 0);
                    }
                    if (WxUtil.videoTimeId_ > 0) {
                        TimedTaskInst.remove(WxUtil.videoTimeId_);
                        WxUtil.videoTimeId_ = 0;
                    }
                    WxUtil.videoBonusCallback_ = null;
                };
                let errorCB = function (res) {
                    console.log('Ads error callback', res.errMsg);
                    GameEventMgrInst.addEvent(EventType.kAudioResume);
                    if (errCb)
                        errCb(res);
                    WxUtil.videoBonusCallback_ = null;
                };
                WxUtil.videoAd_ = wx.createRewardedVideoAd({
                    adUnitId: unitID
                });
                WxUtil.videoAd_.load()
                    .then(() => {
                    WxUtil.videoAd_.show()
                        .then(() => {
                        console.log('video show');
                        GameEventMgrInst.addEvent(EventType.kAudioPause);
                    })
                        .catch(err => console.log('video err', err));
                    WxUtil.videoAdsProtectFlags_.put(unitID, 0);
                })
                    .catch(err => console.log(err.errMsg));
                if (this.videoAdsCallbackMap_.containsKey(unitID)) {
                    let info = this.videoAdsCallbackMap_.get(unitID);
                    WxUtil.videoAd_.offClose(info.closeCallback);
                    WxUtil.videoAd_.offError(info.errCallback);
                    this.videoAdsCallbackMap_.remove(unitID);
                }
                WxUtil.videoAd_.onClose(closeCB);
                WxUtil.videoAd_.onError(errorCB);
                let info = new VideoAdsInfo(closeCB, errorCB);
                this.videoAdsCallbackMap_.put(unitID, info);
                if (createCb)
                    createCb();
            }
            else {
                WxUtil.modalDialog('提示', '微信版本较低，暂不支持视频观看', null, null, false);
            }
        }
        static addInterstitialAd(id) {
            let info = WxUtil.sdkInfo;
            if (WxUtil.compareVersionForWx(info.SDKVersion, '2.6.0') != -1) {
                try {
                    this.interAd = wx.createInterstitialAd({ adUnitId: id });
                }
                catch (error) {
                    console.log('addInterstitialAd', error);
                }
            }
        }
        static showInterstitialAd() {
            let info = WxUtil.sdkInfo;
            if (WxUtil.compareVersionForWx(info.SDKVersion, '2.6.0') != -1 && this.interAd) {
                try {
                    this.interAd.show();
                }
                catch (error) {
                    console.log('showInterstitialAd', error);
                }
            }
        }
        static checkVersionUpdate(cbUpdate, cbNoUpdate) {
            let info = WxUtil.sdkInfo;
            if (WxUtil.compareVersionForWx(info.SDKVersion, '1.9.90') != -1) {
                let opSys = info.system;
                let idx = opSys.indexOf('Android');
                if (idx !== -1) {
                    let ver = opSys.substr(7).trim();
                    if (WxUtil.compareVersionForWx(ver, '6.6.7') == -1) {
                        G.log('skip update cause the system version is too low', 1, ver);
                        if (cbNoUpdate)
                            cbNoUpdate();
                        return;
                    }
                }
                G.log('check version update', info.system);
                const updateManager = wx.getUpdateManager();
                updateManager.onCheckForUpdate(function (res) {
                    console.log(res.hasUpdate);
                    if (res.hasUpdate) {
                        if (cbUpdate)
                            cbUpdate();
                    }
                    else {
                        if (cbNoUpdate)
                            cbNoUpdate();
                    }
                });
                updateManager.onUpdateReady(function () {
                    WxUtil.modalDialog('更新提示', '新版本已经准备好，请重启游戏', function () {
                        updateManager.applyUpdate();
                    }, null, false);
                });
                updateManager.onUpdateFailed(function () {
                    WxUtil.modalDialog('更新提示', '新版本下载失败，请确认网络环境是否良好或者重启微信', null, null, false);
                });
            }
            else {
                WxUtil.modalDialog('微信更新提示', '当前微信版本较低，建议升级以保障游戏体验', null, null, false);
                if (cbNoUpdate)
                    cbNoUpdate();
            }
        }
        static modalDialog(head, text, confirmCb, cancelCb, bSingleBtn = true, noTxt = '取消', noClr = '#000000', yesTxt = '确定', yesClr = '#3cc51f') {
            wx.showModal({
                title: head,
                content: text,
                showCancel: bSingleBtn,
                cancelText: noTxt,
                cancelColor: noClr,
                confirmText: yesTxt,
                confirmColor: yesClr,
                success: function (res) {
                    if (res.confirm) {
                        if (confirmCb)
                            confirmCb();
                    }
                    else if (res.cancel) {
                        if (cancelCb)
                            cancelCb();
                    }
                }
            });
        }
        static toast(text, dura = 1500) {
            wx.showToast({ title: text, duration: dura, icon: 'none' });
        }
        static showGameClub(left, top, width, height) {
            if (WxUtil.compareVersionForWx(this.sdkInfo.SDKVersion, '2.0.3') != -1) {
                if (this.gameClub_ == null) {
                    this.gameClub_ = wx.createGameClubButton({
                        type: 'image',
                        text: '',
                        image: '',
                        style: {
                            left: left,
                            top: top,
                            width: width,
                            height: height,
                        },
                        icon: 'dark'
                    });
                }
                this.gameClub_.show();
            }
        }
        static hideGameClub() {
            if (G.isExistObj(this.gameClub_)) {
                this.gameClub_.hide();
            }
        }
        static removeGameClub() {
            if (G.isExistObj(this.gameClub_)) {
                this.gameClub_.destroy();
                this.gameClub_ = null;
            }
        }
        static vibrateShort() {
            if (WxUtil.compareVersionForWx(this.sdkInfo.SDKVersion, '1.2.0') != -1)
                wx.vibrateShort();
        }
        static vibrateLong() {
            if (WxUtil.compareVersionForWx(this.sdkInfo.SDKVersion, '1.2.0') != -1)
                wx.vibrateLong();
        }
        static setAudioOption(mixWithOther, obeyMuteSwitch) {
            if (WxUtil.compareVersionForWx(this.sdkInfo.SDKVersion, '2.3.0') != -1) {
                wx.setInnerAudioOption({ mixWithOther: mixWithOther, obeyMuteSwitch: obeyMuteSwitch });
            }
        }
        static playAudio(path, bLoop = false, startTime = 0, volume = 1, bAuto = false) {
            let info = null;
            if (this.audioInfoMap_.containsKey(path)) {
                info = this.audioInfoMap_.get(path);
            }
            else {
                info = new AudioInfo(path);
                this.audioInfoMap_.put(path, info);
            }
            if (info) {
                let audio = info.obj;
                if (audio) {
                    audio.src = path;
                    audio.startTime = startTime;
                    audio.volume = volume;
                    audio.loop = bLoop;
                    audio.autoplay = bAuto;
                    audio.play();
                }
            }
        }
        static addAudioCallback(path, endCb) {
            if (this.audioInfoMap_.containsKey(path)) {
                let info = this.audioInfoMap_.get(path);
                if (info.endCallback)
                    info.obj.offEnded(info.endCallback);
                info.endCallback = endCb;
                info.obj.onEnded(info.endCallback);
            }
        }
        static resumeAudio(path) {
            if (this.audioInfoMap_.containsKey(path)) {
                let info = this.audioInfoMap_.get(path);
                info.obj.play();
            }
        }
        static pauseAudio(path) {
            if (this.audioInfoMap_.containsKey(path)) {
                let info = this.audioInfoMap_.get(path);
                info.obj.pause();
            }
        }
        static stopAudio(path) {
            if (this.audioInfoMap_.containsKey(path)) {
                let info = this.audioInfoMap_.get(path);
                info.obj.stop();
            }
        }
        static destroyAudio(path) {
            if (this.audioInfoMap_.containsKey(path)) {
                let info = this.audioInfoMap_.get(path);
                if (info.endCallback)
                    info.obj.offEnded(info.endCallback);
                info.obj.destroy();
                this.audioInfoMap_.remove(path);
            }
        }
    }
    WxUtil.sdkInfo = null;
    WxUtil.domain_ = kComLoginDomain;
    WxUtil.loginCode = '';
    WxUtil.videoBonusCallback_ = null;
    WxUtil.videoAd_ = null;
    WxUtil.videoTimeId_ = 0;
    WxUtil.videoAdsProtectFlags_ = new HDMap();
    WxUtil.videoAdsCallbackMap_ = new HDMap();
    WxUtil.interAd = null;
    WxUtil.gameClub_ = null;
    WxUtil.audioInfoMap_ = new HDMap();
    class AudioInfo {
        constructor(path) {
            this.obj = null;
            this.endCallback = null;
            this.obj = wx.createInnerAudioContext();
        }
    }
    class VideoAdsInfo {
        constructor(closeCb, errCb) {
            this.closeCallback = null;
            this.errCallback = null;
            this.closeCallback = closeCb;
            this.errCallback = errCb;
        }
    }

    var BgmType;
    (function (BgmType) {
        BgmType[BgmType["kBgmMenu"] = 0] = "kBgmMenu";
        BgmType[BgmType["kNone"] = 9999] = "kNone";
    })(BgmType || (BgmType = {}));
    const kBgms = [
        'bgm_menu',
    ];
    var SfxType;
    (function (SfxType) {
        SfxType[SfxType["kGoodClick"] = 0] = "kGoodClick";
        SfxType[SfxType["kLuckyBox"] = 1] = "kLuckyBox";
        SfxType[SfxType["kNone"] = 9999] = "kNone";
    })(SfxType || (SfxType = {}));
    const kSfxSet = [
        'goodClick',
        'luckybox',
    ];
    class AudioMgr {
        constructor() {
            this.bMuteMusic_ = false;
            this.bMuteSound_ = false;
            this.curBgmType_ = BgmType.kNone;
            this.bgmId_ = 0;
            this.maxBgmVol_ = 1;
            this.maxSfxVol_ = 1;
            this.maxFadeVol_ = 0;
            this.bgms_ = new HDMap();
            this.sfxMap_ = new HDMap();
            this.fadeTimeTaskId_ = 0;
        }
        isStopMusic() {
            return this.bMuteMusic_;
        }
        isStopSound() {
            return this.bMuteSound_;
        }
        init() {
            Laya.SoundManager.autoReleaseSound = false;
            GameEventMgrInst.addListener(EventType.kAudioPause, this.pauseMusic.bind(this), true);
            GameEventMgrInst.addListener(EventType.kAudioResume, this.resumeMusic.bind(this), true);
            this._readData();
        }
        start() {
        }
        setIfMuteMusic(bVal) {
            let bMute = this.bMuteMusic_;
            this.bMuteMusic_ = bVal;
            if (bVal) {
                if (G.isWeChat) {
                    this.pauseMusic();
                }
                else
                    Laya.SoundManager.stopMusic();
            }
            else {
                if (G.isWeChat) {
                    this.resumeMusic();
                }
                else
                    Laya.SoundManager.playMusic(this.bgms_.get(this.curBgmType_), 1);
            }
            if (bMute != bVal)
                this._saveData();
        }
        setIfMuteSound(bVal) {
            let bMute = this.bMuteSound_;
            this.bMuteSound_ = bVal;
            if (bVal)
                Laya.SoundManager.stopAllSound();
            if (bMute != bVal)
                this._saveData();
        }
        setBgmVolume(val) {
            this.maxBgmVol_ = val;
            Laya.SoundManager.setMusicVolume(val);
            if (val != this.maxBgmVol_)
                this._saveData();
        }
        setSfxVolume(val) {
            this.maxSfxVol_ = val;
            Laya.SoundManager.setSoundVolume(val);
            if (val != this.maxSfxVol_)
                this._saveData();
        }
        _saveData() {
            let sav = {
                bMuteBgm: this.bMuteMusic_,
                bMuteSfx: this.bMuteSound_,
                maxBgmVol: this.maxBgmVol_,
                maxSfxVol: this.maxSfxVol_
            };
            GameStorage$1.writeJSON(SaveDef$1.kAudio, sav);
        }
        _readData() {
            let sav = GameStorage$1.readJSON(SaveDef$1.kAudio);
            if (G.isExistObj(sav)) {
                this.bMuteMusic_ = sav.bMuteBgm;
                this.bMuteSound_ = sav.bMuteSfx;
                this.maxBgmVol_ = sav.maxBgmVol;
                this.maxSfxVol_ = sav.maxSfxVol;
            }
            else
                this._saveData();
            this.setBgmVolume(this.maxBgmVol_);
            this.setSfxVolume(this.maxSfxVol_);
        }
        playMusic(type, callback) {
            if (type !== BgmType.kNone && kBgms[type]) {
                Laya.SoundManager.stopMusic();
                this.curBgmType_ = type;
                let name = '';
                if (this.bgms_.containsKey(type))
                    name = this.bgms_.get(type);
                else {
                    name = ResManager.nativePath + 'audio/' + kBgms[type] + '.mp3';
                    this.bgms_.put(type, name);
                }
                let loop = callback ? 1 : 0;
                let handle = null;
                if (callback)
                    handle = Laya.Handler.create(this, this._loadBgm, [type, callback]);
                if (!this.bMuteMusic_) {
                    if (G.isWeChat) {
                        WxUtil.playAudio(name, true);
                        if (callback)
                            WxUtil.addAudioCallback(name, handle);
                    }
                    else
                        Laya.SoundManager.playMusic(name, loop, handle);
                }
            }
            else {
                G.log("can't find Bgm", type);
            }
        }
        _loadBgm(type, callback) {
            if (callback)
                callback(type);
        }
        resumeMusic() {
            if (!this.bMuteMusic_) {
                if (G.isWeChat) {
                    let name = this.bgms_.get(this.curBgmType_);
                    if (name)
                        WxUtil.resumeAudio(name);
                }
                else
                    Laya.SoundManager.setMusicVolume(this.maxBgmVol_);
            }
        }
        pauseMusic() {
            if (G.isWeChat) {
                let name = this.bgms_.get(this.curBgmType_);
                if (name)
                    WxUtil.pauseAudio(name);
            }
            else
                Laya.SoundManager.setMusicVolume(0);
        }
        stopEffects() {
            Laya.SoundManager.stopAllSound();
        }
        stopMusic() {
            if (G.isWeChat) {
                let name = this.bgms_.get(this.curBgmType_);
                if (name)
                    WxUtil.stopAudio(name);
            }
            else
                Laya.SoundManager.stopMusic();
        }
        replayMusic() {
            if (this.curBgmType_ && this.bgms_.containsKey(this.curBgmType_)) {
                if (G.isWeChat) {
                    let name = this.bgms_.get(this.curBgmType_);
                    if (name)
                        WxUtil.playAudio(name, true);
                }
                else {
                    Laya.SoundManager.stopMusic();
                    Laya.SoundManager.playMusic(this.bgms_.get(this.curBgmType_), 1);
                }
            }
        }
        changeBgmWithFade(t, fadeDura = 1) {
            TimedTaskMgr.instance.remove(this.fadeTimeTaskId_);
            if (this.maxFadeVol_ > 0)
                this.maxBgmVol_ = this.maxFadeVol_;
            this.maxFadeVol_ = this.maxBgmVol_;
            let maxBgmVol = this.maxBgmVol_;
            let interval = fadeDura / 10;
            let fadeSpd = this.maxFadeVol_ / 10 * 2;
            let bPlayed = false;
            this.fadeTimeTaskId_ = TimedTaskMgr.instance.add(() => {
                if (this.maxBgmVol_ > 0 && !bPlayed) {
                    this.maxBgmVol_ -= fadeSpd;
                    if (this.maxBgmVol_ <= 0) {
                        this.maxBgmVol_ = 0;
                        this.playMusic(t);
                        bPlayed = true;
                    }
                }
                else {
                    this.maxBgmVol_ += fadeSpd;
                    if (this.maxBgmVol_ >= maxBgmVol) {
                        this.maxBgmVol_ = maxBgmVol;
                    }
                }
                G.log(this.maxBgmVol_);
                this.setBgmVolume(this.maxBgmVol_);
            }, 0, 10, interval);
        }
        playSound(type, callback, bLoop = false) {
            if (type !== SfxType.kNone && kSfxSet[type]) {
                let handle = null;
                if (callback && !bLoop)
                    handle = Laya.Handler.create(this, this._loadSfx, [type, callback]);
                let name = '';
                if (this.sfxMap_.containsKey(type))
                    name = this.sfxMap_.get(type);
                else {
                    name = ResManager.nativePath + 'audio/' + kSfxSet[type] + '.mp3';
                    this.sfxMap_.put(type, name);
                }
                let loop = bLoop ? 0 : 1;
                if (!this.bMuteSound_)
                    Laya.SoundManager.playSound(name, loop, handle);
            }
            else
                G.log("can't find Sfx", type);
        }
        _loadSfx(type, callback) {
            if (callback)
                callback(type);
        }
    }
    AudioMgr.instance = new AudioMgr();

    const kNetCfg = {
        resServer: 'https://huandong-1257458597.cos.ap-guangzhou.myqcloud.com/HDSDK/NavList/Pub/',
        qrResServer: 'https://huandong-1257458597.cos.ap-guangzhou.myqcloud.com/HDSDK/NavList/QRCode/',
        bnrResServer: 'https://huandong-1257458597.cos.ap-guangzhou.myqcloud.com/HDSDK/NavList/Banner/',
        commServer: "https://login.joyfulh.com/comLogin",
        statServer: "https://statistic.joyfulh.com/statistic",
        nav: '/jumpData/getJumpData',
        updImportStat: '/data/updImportStat',
        updExportStat: '/data/updExportStat'
    };
    class SendData {
        constructor() {
            this.url = '';
            this.data = '';
        }
    }
    const kRefreshTime = 15 * 60 * 1000;
    const kRequestTime = 10 * 1000;
    const kRequestInterval = 15 * 1000;
    const kMaxRequests = 5;
    class ReqData {
        constructor() {
            this.gridCb = null;
            this.likeCb = null;
            this.qrCb = null;
            this.bnrCb = null;
        }
    }
    class HDNavData {
        constructor() {
            this.sn = 0;
            this.path = '';
            this.img = '';
            this.type = 0;
            this.extra = null;
            this.appId = '';
            this.id = '';
            this.name = '';
            this.alias = '';
            this.qrUrl = '';
            this.bnrUrl = '';
            this.tag = 0;
            this.verCode = '';
            this.box = 0;
        }
    }
    class HDSDK {
        static get needUpdateNavData() {
            return this.bUpdateNav_;
        }
        static get isDataExisted() {
            return this.bDataExisted_;
        }
        static get getForceNavIds() {
            return this.forceIds_;
        }
        static getForceNavData(appId) {
            let ret = null;
            if (this.forceMap_[appId]) {
                let arr = this.forceMap_[appId];
                if (arr) {
                    let min = 0;
                    let max = arr.length - 1;
                    ret = arr[Math.round(Math.random() * (max - min)) + min];
                }
            }
            return ret;
        }
        static register(proName, gridCb, likeCb, qrCb, bnrCb) {
            this._readSave();
            this.bRegister_ = true;
            let diff = Date.now() - this.loginTime_;
            if (this.openID_ && this.openID_ !== '' && this.openID_ != 'null' &&
                diff <= 14400000) {
                this.init(this.openID_, proName, gridCb, likeCb, qrCb, bnrCb);
                console.log('[HDSDK] no need login', diff, this.openID_);
            }
            else {
                if (this._isWechat) {
                    console.log('[HDSDK] login for SDK');
                    this._login(proName, gridCb, likeCb, qrCb, bnrCb);
                }
                else {
                    this.init('', proName, gridCb, likeCb, qrCb, bnrCb);
                }
            }
        }
        static init(openId, proName, gridCb, likeCb, qrCb, bnrCb) {
            this.openID_ = openId || '';
            this.proName_ = proName;
            if (!this.bRegister_)
                this._readSave();
            console.log('[HDSDK] init', this.newUser_, proName, this.openID_);
            let bRefresh = Date.now() - this.lastRefreshTime_ > kRefreshTime;
            if (!bRefresh) {
                if (this.gridArr_.length > 0 && gridCb)
                    gridCb(this.gridArr_);
                if (this.likeArr_.length > 0 && likeCb)
                    likeCb(this.likeArr_);
                if (this.qrArr_.length > 0 && qrCb)
                    qrCb(this.qrArr_);
                if (this.bnrArr_.length > 0 && bnrCb)
                    bnrCb(this.bnrArr_);
            }
            else {
                this.bDownloaded_ = false;
                this.loadNativeData(gridCb, likeCb, qrCb, bnrCb);
                this._requstQueue(gridCb, likeCb, qrCb, bnrCb);
            }
            if (this._isWechat) {
                let op = wx.getLaunchOptionsSync();
                if (op.query && (op.query.hdg && op.query.hdg != '' ||
                    op.query.HDg_nav_0 && op.query.HDg_nav_0 != '')) {
                    let src = op.query.HDg_nav_0 || op.query.hdg;
                    this._reportImportStat(proName, openId, src);
                }
            }
            this.bRegister_ = false;
            this.newUser_ = 0;
            if (this.openID_ != '' && this.openID_ != 'null') {
                if (this._isWechat) {
                    wx.setStorageSync('user', this.openID_);
                    wx.setStorageSync('login', this.loginTime_);
                }
                else {
                    localStorage.setItem('user', this.openID_);
                }
            }
        }
        static loadNativeData(gridCb, likeCb, qrCb, bnrCb) {
            if (!this.bLoadedNative_) {
                if (typeof window['Laya'] !== 'undefined') {
                    window['Laya'].loader.load('data/hd_nav.json', window['Laya'].Handler.create(null, () => {
                        let res = window['Laya'].loader.getRes('data/hd_nav.json');
                        if (res) {
                            this._parseNavData(res, gridCb, likeCb, qrCb, bnrCb);
                            window['Laya'].loader.clearRes('data/hd_nav.json');
                        }
                        else
                            console.log('no native data');
                    }), null, window['Laya'].Loader.JSON);
                }
                else if (typeof window['cc'] !== 'undefined') {
                    window['cc'].loader.loadRes('data/hd_nav.json', window['cc'].JsonAsset, function (err, res) {
                        if (err)
                            console.log('no native data');
                        else {
                            this._parseNavData(res.json, gridCb, likeCb, qrCb, bnrCb);
                            window['cc'].loader.release(res);
                        }
                    });
                }
            }
        }
        static getGridArray() {
            return this.gridArr_;
        }
        static getLikeArray() {
            return this.likeArr_;
        }
        static getQRCodeArray() {
            return this.qrArr_;
        }
        static getBannerArray() {
            return this.bnrArr_;
        }
        static navigate(id, sucCb, failCb) {
            if (this._isWechat) {
                if (this.datMap_[id]) {
                    let dat = this.datMap_[id];
                    if (dat.type === 3) {
                        wx.previewImage({
                            urls: [dat.qrUrl],
                            success: (res) => {
                                console.log('[HDSDK] navigate qr');
                            }
                        });
                    }
                    else {
                        let info = wx.getSystemInfoSync();
                        if (this._compareVersionForWx(info.SDKVersion, '2.2.0') == 1) {
                            if (dat.box === 1) {
                                if (info.platform.indexOf('ios') !== -1) {
                                    if (failCb)
                                        failCb();
                                    return;
                                }
                            }
                            wx.navigateToMiniProgram({
                                appId: dat.appId,
                                path: dat.path,
                                extraData: dat.extra,
                                success: () => {
                                    this._reportExportStat(dat);
                                    if (sucCb)
                                        sucCb();
                                },
                                fail: () => {
                                    if (failCb)
                                        failCb();
                                }
                            });
                        }
                        else {
                            wx.showModal({
                                title: '版本提示',
                                content: '微信版本较低，暂不支持游戏跳转',
                            });
                        }
                    }
                }
            }
            else {
                let dat = this.datMap_[id];
                console.log('[HDSDK] not wechat platform,navigate data is', dat.sn, dat.name, dat);
            }
        }
        static uploadImportData(src) {
            if (this.newUser_ === 1)
                this._reportImportStat(this.proName_, this.openID_, src);
        }
        static _fetchData(proName, gridCb, likeCb, qrCb, bnrCb) {
            if (proName && proName !== '') {
                this._getNavData(proName, (dat) => {
                    console.log('[HDSDK] fetch data', dat);
                    if (dat && dat.res) {
                        if (this.currPage_ === 1 && dat.res.length > 0) {
                            this.bUpdateNav_ = true;
                            this.bDownloaded_ = true;
                            this.datMap_ = {};
                            this.forceMap_ = {};
                            this.forceIds_ = [];
                            this.gridArr_ = [];
                            this.likeArr_ = [];
                            this.qrArr_ = [];
                            this.bnrArr_ = [];
                            this.reqQue_ = [];
                            this.bDataExisted_ = false;
                            console.log('[HDSDK] page one clear flag');
                        }
                        if (dat.res.length > 0) {
                            ++this.currPage_;
                            this._fetchData(proName, gridCb, likeCb, qrCb, bnrCb);
                        }
                        let arr = dat.res;
                        for (let i = 0; i < arr.length; ++i) {
                            this._createNavData(arr[i]);
                        }
                        if (this.gridArr_.length > 0 || this.likeArr_.length > 0)
                            this.lastRefreshTime_ = Date.now();
                        else
                            this.lastRefreshTime_ = 0;
                        if (dat.res.length == 0 && this.currPage_ >= 1) {
                            if (gridCb)
                                gridCb(this.gridArr_);
                            if (likeCb)
                                likeCb(this.likeArr_);
                            if (qrCb)
                                qrCb(this.qrArr_);
                            if (bnrCb)
                                bnrCb(this.bnrArr_);
                            this.bDataExisted_ = true;
                        }
                    }
                });
            }
        }
        static _readSave() {
            let usr = null;
            if (this._isWechat) {
                try {
                    usr = wx.getStorageSync('user');
                    let t = wx.getStorageSync('login');
                    this.loginTime_ = Number(t);
                }
                catch (e) {
                    this.loginTime_ = 0;
                    usr = null;
                }
            }
            else {
                usr = localStorage.getItem('user');
            }
            if (usr) {
                this.newUser_ = 0;
                console.log('[HDSDK] read dat', usr, this.loginTime_);
                if (usr != '' && usr != 'null') {
                    this.openID_ = usr;
                }
            }
            else
                this.newUser_ = 1;
        }
        static _getNavData(proName, sucCb) {
            let url = kNetCfg.commServer + kNetCfg.nav;
            let data = {
                proName: proName,
                page: this.currPage_,
                limit: 20
            };
            this._common(url, data, sucCb);
        }
        static _parseNavData(data, gridCb, likeCb, qrCb, bnrCb) {
            if (this.bDownloaded_)
                return;
            for (const key in data) {
                if (data.hasOwnProperty(key))
                    this._createNavData(data[key], true);
            }
            if (gridCb && this.gridArr_.length > 0)
                gridCb(this.gridArr_);
            if (likeCb && this.likeArr_.length > 0)
                likeCb(this.likeArr_);
            if (qrCb && this.qrArr_.length > 0)
                qrCb(this.qrArr_);
            if (bnrCb && this.bnrArr_.length > 0)
                bnrCb(this.bnrArr_);
            this.bLoadedNative_ = true;
            this.bDataExisted_ = true;
            console.log('[HDSDK] load native data');
        }
        static _checkUpdate(raw) {
            let bRet = false;
            let id = raw.id + '_' + raw.s;
            if (this.datMap_[id]) {
                let dat = this.datMap_[id];
                let code = this._genVerificationCode(raw);
                if (dat.verCode != code) {
                    bRet = true;
                }
            }
            return bRet;
        }
        static _createNavData(raw, bGenCode = false) {
            let nav = new HDNavData();
            let img = raw.img;
            if (img.indexOf('.') !== -1) {
                nav.img = kNetCfg.resServer + raw.img;
            }
            else
                nav.img = kNetCfg.resServer + raw.img + '.png';
            nav.sn = raw.s;
            nav.type = raw.t;
            nav.name = raw.n;
            nav.path = raw.p;
            nav.alias = raw.a;
            if (raw.e !== '')
                nav.extra = JSON.parse(raw.e);
            nav.appId = raw.id;
            nav.id = nav.appId + '_' + nav.sn;
            if (bGenCode)
                nav.verCode = this._genVerificationCode(raw);
            if (nav.extra) {
                if (nav.extra.bnr) {
                    let bnr = nav.extra.bnr;
                    if (bnr.indexOf('.') !== -1) {
                        nav.bnrUrl = kNetCfg.bnrResServer + bnr;
                    }
                    else
                        nav.bnrUrl = kNetCfg.bnrResServer + bnr + '.png';
                    this.bnrArr_.push(nav);
                }
                if (nav.extra.tag)
                    nav.tag = 1;
                if (nav.extra.box)
                    nav.box = 1;
                if (nav.extra.force) {
                    if (this.forceMap_[nav.appId]) {
                        let arr = this.forceMap_[nav.appId];
                        arr.push(nav);
                    }
                    else {
                        this.forceMap_[nav.appId] = [];
                        this.forceMap_[nav.appId].push(nav);
                        this.forceIds_.push(nav.appId);
                    }
                }
            }
            if (raw.t === 1) {
                this.gridArr_.push(nav);
            }
            else if (raw.t === 2) {
                this.likeArr_.push(nav);
            }
            else if (raw.t === 3) {
                if (nav.extra && nav.extra.qr) {
                    let qr = nav.extra.qr;
                    if (qr.indexOf('.') !== -1) {
                        nav.qrUrl = kNetCfg.qrResServer + qr;
                    }
                    else
                        nav.qrUrl = kNetCfg.qrResServer + qr + '.png';
                }
                this.qrArr_.push(nav);
            }
            else if (raw.t === 4) {
                this.gridArr_.push(nav);
                this.likeArr_.push(nav);
            }
            this.datMap_[nav.id] = nav;
        }
        static _genVerificationCode(raw) {
            let code = '';
            let start = raw.s + raw.n + raw.a;
            let p = raw.p;
            let mid = p.length + p.charAt(0) + p.charAt(Math.round(p.length / 2)) + p.charAt(p.length - 1);
            let end = '';
            if (raw.e !== '') {
                let e = raw.e;
                end = e.length + e.charAt(0) + e.charAt(Math.round(e.length / 2)) + e.charAt(e.length - 1);
            }
            code = start + mid + end;
            return code;
        }
        static _reportImportStat(proName, openId, src) {
            if (openId != null && openId != 'null' && openId != '') {
                let url = kNetCfg.statServer + kNetCfg.updImportStat;
                let data = {
                    proName: proName,
                    openid: openId,
                    source: src
                };
                this._common(url, data, null);
                console.log('[HDSDK] import stat', openId, src);
            }
            else {
                this._login(proName);
                console.error('[HDSDK] _reportImportStat openId不存在，请保证openId的获取');
            }
        }
        static _reportExportStat(dat) {
            if (this.openID_ != null && this.openID_ != 'null' && this.openID_ != '') {
                let url = kNetCfg.statServer + kNetCfg.updExportStat;
                let loc = '';
                if (dat.bnrUrl !== '')
                    loc = 'banner' + dat.sn;
                else {
                    if (dat.type == 1)
                        loc = 'grid' + dat.sn;
                    else if (dat.type == 2)
                        loc = 'like' + dat.sn;
                    else if (dat.type == 4)
                        loc = 'all' + dat.sn;
                }
                let data = {
                    proName: this.proName_,
                    openid: this.openID_,
                    gameName: dat.name,
                    location: loc,
                    appid: dat.appId,
                    alias: dat.alias
                };
                this._common(url, data, null);
                console.log('[HDSDK] export stat', this.openID_, dat.appId, dat.id, dat.name);
            }
            else
                console.error('[HDSDK] _reportExportStat openId不存在，请保证openId的获取');
        }
        static _common(url, data, sucCb, failCb) {
            if (data == null) {
                console.error('[HttpRequest] failed');
                return;
            }
            let sd = new SendData();
            sd.url = url;
            if (typeof data == 'object') {
                for (const key in data) {
                    if (data.hasOwnProperty(key)) {
                        const val = data[key];
                        if (val == null)
                            continue;
                        if (sd.data != '')
                            sd.data += '&';
                        if (typeof val == 'object') {
                            let str = JSON.stringify(val);
                            sd.data += key + '=' + encodeURI(str);
                        }
                        else if (typeof val == 'string' || typeof val == 'number' || typeof val == 'boolean') {
                            sd.data += key + '=' + encodeURI(val.toString());
                        }
                        else {
                            sd.data += key + '=' + encodeURI(val.toString());
                            console.warn('[HttpRequest] please check your data type,only support object,string,number or boolean');
                        }
                    }
                }
            }
            else
                sd.data = encodeURI(data);
            this._send(sd, sucCb, failCb);
            sd = null;
        }
        static _send(sendData, sucCb, failCb) {
            let xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                    console.log('[HDSDK] req succ', xhr.responseText);
                    if (sucCb)
                        sucCb(JSON.parse(xhr.responseText));
                }
                else if (xhr.status < 200 || xhr.status >= 400) {
                    console.log('[HDSDK] conn', xhr.readyState, xhr.status);
                }
            };
            xhr.onerror = function () {
                console.log('[HDSDK] error', xhr.status);
                if (failCb)
                    failCb();
            };
            let url = sendData.url + '?' + sendData.data;
            xhr.open("GET", url, true);
            xhr.send();
        }
        static _compareVersionForWx(v1Str, v2Str) {
            let v1 = v1Str.split('.');
            let v2 = v2Str.split('.');
            let len = Math.max(v1.length, v2.length);
            while (v1.length < len) {
                v1.push('0');
            }
            while (v2.length < len) {
                v2.push('0');
            }
            for (let i = 0; i < len; i++) {
                let num1 = parseInt(v1[i]);
                let num2 = parseInt(v2[i]);
                if (num1 > num2) {
                    return 1;
                }
                else if (num1 < num2) {
                    return -1;
                }
            }
            return 0;
        }
        static _requstQueue(gridCb, likeCb, qrCb, bnrCb) {
            if (this.reqLimited_ < kMaxRequests && !this.bDownloaded_) {
                let rd = new ReqData();
                rd.gridCb = gridCb;
                rd.likeCb = likeCb;
                rd.qrCb = qrCb;
                rd.bnrCb = bnrCb;
                this.reqQue_.push(rd);
                console.log('[HDSDK] _requstQueue', this.reqQue_.length);
            }
            ++this.reqLimited_;
            this._requestProc();
        }
        static _requestProc() {
            let bReq = Date.now() - this.lastReqTime_ > kRequestTime;
            if (bReq) {
                let rd = this.reqQue_.shift();
                if (rd) {
                    this.lastReqTime_ = Date.now();
                    this.currPage_ = 1;
                    this._fetchData(this.proName_, rd.gridCb, rd.likeCb, rd.qrCb, rd.bnrCb);
                    clearTimeout(this.reqTimerId_);
                    this.reqTimerId_ = setTimeout(this._requestProc.bind(this), kRequestInterval);
                    console.log('[HDSDK] _requestProc', this.reqQue_.length);
                }
            }
        }
        static _login(proName, gridCb, likeCb, qrCb, bnrCb) {
            wx.login({
                success: (loginRes) => {
                    if (loginRes.code) {
                        wx.request({
                            url: kNetCfg.commServer + '/user/getSessionKey',
                            data: {
                                code: loginRes.code,
                                proName: proName,
                                choose: '1',
                            },
                            header: {
                                'content-type': 'application/json'
                            },
                            method: 'GET',
                            dataType: 'json',
                            success: (res) => {
                                if (res.statusCode >= 200 && res.statusCode <= 400) {
                                    console.log('[HDSDK] login request succ', res);
                                    this.loginTime_ = Date.now();
                                    let dat = JSON.parse(res.data.res);
                                    if (dat && dat.openId) {
                                        this.init(dat.openId, proName, gridCb, likeCb, qrCb, bnrCb);
                                    }
                                }
                                else {
                                    console.log('[HDSDK] login request fail', res);
                                    this.init('', proName, gridCb, likeCb, qrCb, bnrCb);
                                }
                            },
                            fail: (res) => {
                                console.log('[HDSDK] login request error', res);
                            },
                        });
                    }
                },
                fail: (loginRes) => {
                    console.log('[HDSDK] wx login error', loginRes);
                    this.init('', proName, gridCb, likeCb, qrCb, bnrCb);
                },
                complete: (loginRes) => {
                }
            });
        }
        static get _isWechat() {
            return typeof wx !== 'undefined';
        }
    }
    HDSDK.gridArr_ = [];
    HDSDK.likeArr_ = [];
    HDSDK.qrArr_ = [];
    HDSDK.bnrArr_ = [];
    HDSDK.forceMap_ = {};
    HDSDK.forceIds_ = [];
    HDSDK.datMap_ = {};
    HDSDK.openID_ = '';
    HDSDK.proName_ = '';
    HDSDK.lastRefreshTime_ = 0;
    HDSDK.lastReqTime_ = 0;
    HDSDK.reqQue_ = [];
    HDSDK.reqLimited_ = 0;
    HDSDK.bDownloaded_ = false;
    HDSDK.reqTimerId_ = 0;
    HDSDK.autoTimerId_ = 0;
    HDSDK.newUser_ = 1;
    HDSDK.currPage_ = 1;
    HDSDK.loginTime_ = 0;
    HDSDK.dataLen_ = 0;
    HDSDK.bRegister_ = false;
    HDSDK.bLoadedNative_ = false;
    HDSDK.bUpdateNav_ = false;
    HDSDK.bDataExisted_ = false;

    class RandItem {
        constructor() {
            this.val = 0;
            this.prob = 0;
        }
    }
    class SignInData {
        constructor() {
            this.id = 0;
            this.day = 0;
            this.amountBase = 0;
            this.bAmountCal = false;
            this.items = [];
            this.desc = '';
        }
    }
    class BoxItem {
        constructor() {
            this.idRand = [];
            this.amountRand = [];
            this.idBase = 0;
            this.bIdCal = false;
            this.amountBase = 0;
            this.bAmoutCal = false;
        }
    }
    class BoxData {
        constructor() {
            this.id = 0;
            this.count = 0;
            this.items = [];
        }
    }
    class Category {
        constructor() {
            this.id = 0;
            this.name = '';
            this.res = '';
        }
    }
    class BonusData {
        static fetch(res) {
            this._parseCategory(res.bonusCategory);
            this._parseSignInData(res.signInGenRule);
            this._parseBoxData(res.boxGenRule);
        }
        static getSignInDataGroup(idx) {
            let ret = [];
            ret = this._getDataGroup(this.signInDatMap_, 7, idx);
            return ret;
        }
        static getBoxDataGroup(idx) {
            let ret = [];
            ret = this._getDataGroup(this.boxDataMap_, 3, idx);
            return ret;
        }
        static getSignInBonusID(id) {
            let ret = 0;
            if (this.signInDatMap_.containsKey(id)) {
                let dat = this.signInDatMap_.get(id);
                if (dat.items.length > 0) {
                    if (dat.items.length == 1) {
                        ret = dat.items[0].val;
                    }
                    else {
                        let min = 0;
                        let max = 0;
                        let r = G.randRange(0, 100);
                        for (let i = 0; i < dat.items.length; ++i) {
                            max += dat.items[i].prob;
                            if (r <= max && r > min) {
                                ret = dat.items[i].val;
                                break;
                            }
                            min += dat.items[i].prob;
                        }
                    }
                }
            }
            return ret;
        }
        static getSignInBonusAmount(id, calCb) {
            let ret = 0;
            if (this.signInDatMap_.containsKey(id)) {
                let dat = this.signInDatMap_.get(id);
                if (dat.bAmountCal) {
                    if (calCb)
                        ret = calCb(dat.amountBase);
                    else
                        ret = dat.amountBase;
                }
                else
                    ret = dat.amountBase;
            }
            return ret;
        }
        static getBoxBonusID(item, calCb) {
            return this._calBoxBonusVal(item.idRand, item.idBase, item.bIdCal, calCb);
        }
        static getBoxBonusAmount(item, calCb) {
            return this._calBoxBonusVal(item.amountRand, item.amountBase, item.bAmoutCal, calCb);
        }
        static getBonusCategoryData(id) {
            let ret = null;
            if (this.categoryMap_.containsKey(id)) {
                ret = this.categoryMap_.get(id);
            }
            return ret;
        }
        static _getDataGroup(map, grpLen, grpIdx) {
            let ret = [];
            let size = map.size();
            if (size > 0) {
                while (grpIdx * grpLen > size - 1) {
                    --grpIdx;
                }
                ret = map.values(grpIdx * grpLen, grpLen);
                let i = 0, len = ret.length;
                while (ret.length < grpLen) {
                    ret.push(ret[i]);
                    ++i;
                    if (i >= ret.length)
                        i = 0;
                }
            }
            return ret;
        }
        static _calBoxBonusVal(rands, base, bCal, calCb) {
            let ret = 0;
            if (rands.length == 0) {
                if (bCal) {
                    if (calCb)
                        ret = calCb(base);
                    else
                        ret = base;
                }
                else
                    ret = base;
            }
            else {
                if (rands.length == 1) {
                    ret = rands[0].val;
                }
                else {
                    let min = 0;
                    let max = 0;
                    let r = G.randRange(0, 100);
                    for (let i = 0; i < rands.length; ++i) {
                        max += rands[i].prob;
                        if (r <= max && r > min) {
                            ret = rands[i].val;
                            break;
                        }
                        min += rands[i].prob;
                    }
                }
            }
            return ret;
        }
        static _parseSignInData(res) {
            if (res) {
                for (const key in res) {
                    if (res.hasOwnProperty(key)) {
                        const rawDat = res[key];
                        let dat = new SignInData();
                        dat.id = parseInt(key);
                        dat.day = rawDat.day;
                        let fRet = this._parseFuncGrammar(rawDat.amount);
                        dat.amountBase = fRet.base;
                        dat.bAmountCal = fRet.bCal;
                        dat.items = this._parseRandGrammar(rawDat.bid);
                        dat.desc = rawDat.desc;
                        BonusData.signInDatMap_.put(dat.id, dat);
                    }
                }
            }
        }
        static _parseBoxData(res) {
            if (res) {
                let checkGrammar = (bid, num, items) => {
                    let item = new BoxItem();
                    if (bid !== '') {
                        if (this._isFuncGrammar(bid)) {
                            let fRet = this._parseFuncGrammar(bid);
                            item.idBase = fRet.base;
                            item.bIdCal = fRet.bCal;
                        }
                        else if (this._isRandGrammar(bid)) {
                            item.idRand = this._parseRandGrammar(bid);
                        }
                        else
                            item.idBase = Number(bid);
                    }
                    if (num !== '') {
                        if (this._isFuncGrammar(num)) {
                            let fRet = this._parseFuncGrammar(num);
                            item.amountBase = fRet.base;
                            item.bAmoutCal = fRet.bCal;
                        }
                        else if (this._isRandGrammar(num)) {
                            item.amountRand = this._parseRandGrammar(num);
                        }
                        else
                            item.amountBase = Number(num);
                    }
                    if (item.idBase > 0 || item.idRand.length > 0 ||
                        item.amountBase > 0 || item.amountRand.length > 0) {
                        items.push(item);
                    }
                };
                for (const key in res) {
                    if (res.hasOwnProperty(key)) {
                        const rawDat = res[key];
                        let dat = new BoxData();
                        dat.id = parseInt(key);
                        dat.count = rawDat.count;
                        checkGrammar(rawDat.bid1, rawDat.num1, dat.items);
                        checkGrammar(rawDat.bid2, rawDat.num2, dat.items);
                        checkGrammar(rawDat.bid3, rawDat.num3, dat.items);
                        BonusData.boxDataMap_.put(dat.id, dat);
                    }
                }
            }
        }
        static _parseCategory(res) {
            if (res) {
                for (const key in res) {
                    if (res.hasOwnProperty(key)) {
                        const rawDat = res[key];
                        let dat = new Category();
                        dat.id = parseInt(key);
                        dat.name = rawDat.name;
                        dat.res = rawDat.res;
                        BonusData.categoryMap_.put(dat.id, dat);
                    }
                }
            }
        }
        static _isFuncGrammar(seg) {
            return typeof seg == 'string' && seg.indexOf('f') != -1;
        }
        static _isRandGrammar(seg) {
            return typeof seg == 'string' && seg.indexOf(',') != -1;
        }
        static _parseFuncGrammar(seg) {
            let ret = { base: 0, bCal: false };
            if (typeof seg == 'string' && seg.indexOf('f') != -1) {
                let lb = seg.indexOf('(');
                let rb = seg.indexOf(')');
                if (lb != -1 && rb != -1) {
                    let par = seg.substring(lb + 1, rb);
                    ret.base = Number(par);
                    ret.bCal = true;
                }
                else {
                    ret.base = 1;
                    ret.bCal = false;
                }
            }
            else
                ret.base = Number(seg);
            return ret;
        }
        static _parseRandGrammar(seg) {
            let ret = [];
            if (typeof seg == 'string' && seg.indexOf(',') != -1) {
                let probSum = 0;
                let probFlagCnt = 0;
                let comma = seg.indexOf(',');
                let len = comma != -1 ? 2 : 0;
                while (len > 0) {
                    let item = new RandItem();
                    let grp = comma != -1 ? seg.substring(0, comma) : seg;
                    let colon = grp.indexOf(':');
                    if (colon != -1) {
                        let id = grp.substring(0, colon);
                        item.val = Number(id);
                        if (probSum < 100) {
                            let p = grp.substring(colon + 1);
                            item.prob = Number(p);
                            probSum += item.prob;
                            if (probSum > 100) {
                                let overflow = probSum - 100;
                                item.prob -= overflow;
                                if (item.prob < 0)
                                    item.prob = 0;
                            }
                        }
                        else
                            item.prob = 0;
                    }
                    else {
                        item.val = Number(grp);
                        item.prob = -1;
                        ++probFlagCnt;
                    }
                    --len;
                    if (comma != -1) {
                        seg = seg.substring(comma + 1);
                        comma = seg.indexOf(',');
                        if (comma != -1)
                            ++len;
                    }
                    ret.push(item);
                }
                if (probSum < 100) {
                    let remain = 100 - probSum;
                    if (probFlagCnt > 0) {
                        let avgProb = remain / probFlagCnt;
                        for (let i = 0; i < ret.length; ++i) {
                            if (ret[i].prob == -1)
                                ret[i].prob = avgProb;
                        }
                        ret[ret.length - 1].prob += 0.0000001;
                    }
                    else {
                        ret[ret.length - 1].prob += remain;
                    }
                }
            }
            else {
                let item = new RandItem();
                item.val = Number(seg);
                item.prob = 100;
                ret[0] = item;
            }
            return ret;
        }
    }
    BonusData.signInDatMap_ = new HDMap();
    BonusData.boxDataMap_ = new HDMap();
    BonusData.categoryMap_ = new HDMap();

    const kVideoBonusCnt = 5;
    const kVideoBonusTime = 300;
    const kSignAutoPopCnt = 3;
    var BonusType;
    (function (BonusType) {
        BonusType[BonusType["kCoin"] = 1] = "kCoin";
        BonusType[BonusType["kPiece1"] = 2] = "kPiece1";
        BonusType[BonusType["kPiece2"] = 3] = "kPiece2";
        BonusType[BonusType["kPiece3"] = 4] = "kPiece3";
    })(BonusType || (BonusType = {}));
    class BonusInfo {
        constructor(t, cnt, desc = '') {
            this.type = BonusType.kCoin;
            this.count = 0;
            this.desc = '';
            this.type = t;
            this.count = cnt;
            this.desc = desc;
        }
    }
    class DailyData {
        constructor() {
            this.signInBonusMap = new HDMap();
            this.lastSignInDay = 0;
            this.signInAwarded = 0;
            this.signInAwardCnt = 0;
            this.signInTotalCnt = 0;
            this.videoLimited = 0;
            this.signAutoPopCnt = 2;
            this.videoBonusCnt = 5;
            this.videoBonusTime = 3600;
            this.offlineTimestamp = 0;
        }
    }
    class PlayerProp {
        constructor() {
            this.lv = 1;
            this.coin = 0;
            this.ownRoles = [1];
            this.itemMap = new HDMap();
        }
    }
    class GameUserInfo {
        static get signInAwards() {
            if (GameUserInfo.dailyDat.signInBonusMap.size() === 0 || GameUserInfo.dailyDat.signInAwardCnt >= 7) {
                GameUserInfo.dailyDat.signInBonusMap.clear();
                GameUserInfo.dailyDat.signInAwardCnt = 0;
                let amountCb = (base) => {
                    return base * this.prop.lv;
                };
                let idx = Math.floor((GameUserInfo.dailyDat.signInTotalCnt + 1) / 7);
                let arr = BonusData.getSignInDataGroup(idx);
                for (let i = 0; i < arr.length; ++i) {
                    let dat = arr[i];
                    let t = BonusData.getSignInBonusID(dat.id);
                    let n = BonusData.getSignInBonusAmount(dat.id, amountCb);
                    let d = dat.desc;
                    let bd = BonusData.getBonusCategoryData(t);
                    if (d == '') {
                        d = bd ? '可获得' + bd.name : '可获得奖励';
                    }
                    GameUserInfo.dailyDat.signInBonusMap.put(dat.day, new BonusInfo(t, n, d));
                }
            }
            return GameUserInfo.dailyDat.signInBonusMap;
        }
        static genBoxAwards(num, out) {
            if (out) {
                out.clear();
                if (num < 1)
                    num = 1;
                else if (num > 3)
                    num = 3;
                let idCb = (base) => {
                    return base;
                };
                let amountCb = (base) => {
                    return base * this.prop.lv;
                };
                let arr = BonusData.getBoxDataGroup(0);
                for (let i = 0; i < arr.length; ++i) {
                    if (arr[i].count === num) {
                        for (let j = 0; j < arr[i].items.length; ++j) {
                            let item = arr[i].items[j];
                            let t = BonusData.getBoxBonusID(item, idCb);
                            let n = BonusData.getBoxBonusAmount(item, amountCb);
                            out.put(j + 1, new BonusInfo(t, n));
                        }
                        break;
                    }
                }
            }
        }
        static get isVideoLimited() {
            return GameUserInfo.dailyDat.videoLimited === 1;
        }
        static get isVideoBonus() {
            return GameUserInfo.dailyDat.videoBonusTime <= 0 && GameUserInfo.dailyDat.videoBonusCnt > 0;
        }
        static get isVideoBonusExisted() {
            return GameUserInfo.dailyDat.videoBonusCnt > 0;
        }
        static get isSignInAutoPopout() {
            return GameUserInfo.dailyDat.signAutoPopCnt > 0;
        }
        static get isSignInAwarded() {
            return GameUserInfo.dailyDat.signInAwarded === 1;
        }
        static get isSignIn7Days() {
            return GameUserInfo.dailyDat.signInAwardCnt >= 7;
        }
        static get videoBounsTime() {
            return GameUserInfo.dailyDat.videoBonusTime;
        }
        static limitVideo() {
            GameUserInfo.dailyDat.videoLimited = 1;
        }
        static countSignInPop(bClear = false) {
            if (bClear)
                GameUserInfo.dailyDat.signAutoPopCnt = -1;
            else
                --GameUserInfo.dailyDat.signAutoPopCnt;
        }
        static calVideoBonusTime(val) {
            GameUserInfo.dailyDat.videoBonusTime -= val;
        }
        static countVideoBonus() {
            --GameUserInfo.dailyDat.videoBonusCnt;
        }
        static resetVideoBonusTime() {
            GameUserInfo.dailyDat.videoBonusTime = (kVideoBonusTime * (kVideoBonusCnt - GameUserInfo.dailyDat.videoBonusCnt + 1));
        }
        static setOfflineTimestamp() {
            GameUserInfo.dailyDat.offlineTimestamp = Date.now();
        }
        static calOfflineTime() {
            if (GameUserInfo.dailyDat.offlineTimestamp > 0) {
                let diff = Date.now() - GameUserInfo.dailyDat.offlineTimestamp;
                let sec = diff / 1000;
                GameUserInfo.calVideoBonusTime(sec);
                GameUserInfo.dailyDat.offlineTimestamp += diff;
            }
        }
        static isCoinAfford(val) {
            return GameUserInfo.prop.coin >= val;
        }
        static saveProp() {
            GameStorage$1.writeJSON(SaveDef$1.kPlayer, GameUserInfo.prop);
        }
        static saveSignIn() {
            GameStorage$1.writeJSON(SaveDef$1.kDaily, GameUserInfo.dailyDat);
        }
        static read() {
            let sav = GameStorage$1.readJSON(SaveDef$1.kPlayer);
            if (sav) {
                GameUserInfo.prop.coin = sav.coin;
                GameUserInfo.prop.ownRoles = sav.ownRoles;
                GameUserInfo.prop.itemMap.copy(sav.itemMap);
            }
            else {
                GameUserInfo.prop.itemMap.put(1, 1);
                GameUserInfo.saveProp();
            }
            let signDat = GameStorage$1.readJSON(SaveDef$1.kDaily);
            if (signDat) {
                GameUserInfo.dailyDat.signInAwardCnt = signDat.signInAwardCnt;
                GameUserInfo.dailyDat.lastSignInDay = signDat.lastSignInDay;
                GameUserInfo.dailyDat.signInTotalCnt = signDat.signInTotalCnt;
                let date = new Date();
                if (date.getDate() == GameUserInfo.dailyDat.lastSignInDay) {
                    GameUserInfo.dailyDat.videoLimited = signDat.videoLimited;
                    GameUserInfo.dailyDat.signAutoPopCnt = signDat.signAutoPopCnt;
                    GameUserInfo.dailyDat.videoBonusCnt = signDat.videoBonusCnt;
                    GameUserInfo.dailyDat.videoBonusTime = signDat.videoBonusTime;
                    GameUserInfo.dailyDat.signInAwarded = signDat.signInAwarded;
                }
                else {
                    GameUserInfo.dailyDat.videoLimited = 0;
                    GameUserInfo.dailyDat.signAutoPopCnt = kSignAutoPopCnt;
                    GameUserInfo.dailyDat.videoBonusCnt = kVideoBonusCnt;
                    GameUserInfo.dailyDat.videoBonusTime = kVideoBonusTime;
                    GameUserInfo.dailyDat.signInAwarded = 0;
                    GameUserInfo.dailyDat.lastSignInDay = date.getDate();
                }
                GameUserInfo.dailyDat.offlineTimestamp = signDat.lastTimestamp;
                GameUserInfo.calOfflineTime();
                if (GameUserInfo.dailyDat.signInAwardCnt >= 7) {
                    GameUserInfo.dailyDat.signInBonusMap.clear();
                    GameUserInfo.dailyDat.signInAwardCnt = 0;
                }
                else
                    GameUserInfo.dailyDat.signInBonusMap.copy(signDat.signInBonusMap);
                GameUserInfo.saveSignIn();
            }
            else {
                GameUserInfo.dailyDat.lastSignInDay = 0;
                GameUserInfo.dailyDat.signInAwardCnt = 0;
                GameUserInfo.dailyDat.signInAwarded = 0;
                GameUserInfo.dailyDat.signInTotalCnt = 0;
                GameUserInfo.dailyDat.videoLimited = 0;
                GameUserInfo.dailyDat.signAutoPopCnt = kSignAutoPopCnt;
                GameUserInfo.dailyDat.videoBonusCnt = kVideoBonusCnt;
                GameUserInfo.dailyDat.videoBonusTime = kVideoBonusTime;
                let date = new Date();
                GameUserInfo.dailyDat.lastSignInDay = date.getDate();
                GameUserInfo.saveSignIn();
            }
        }
    }
    GameUserInfo.prop = new PlayerProp();
    GameUserInfo.dailyDat = new DailyData();

    class DataHub {
        static get getMessage() {
            return this.message.sh[G.randRange(0, this.message.sh.length - 1)];
        }
        static loadBackendConfig() {
        }
        static loadJson() {
            G.readJson('data/testDat', (res) => {
                BonusData.fetch(res);
                this.bJsonLoaded = true;
            });
        }
    }
    DataHub.version = '1.0.0';
    DataHub.config = {
        export: 1,
        forceNavProb: 50,
        forceFakePageProb: 0,
        fakeBtnClick: 0,
        directAward: 0,
    };
    DataHub.message = { sh: [{ title: '分享标题，请自行修改',
                img: 'https://huandong-1257458597.cos.ap-guangzhou.myqcloud.com/Shared/test/sh1.png' }] };
    DataHub.bJsonLoaded = false;

    const kUnionID = false;
    class GameLogic {
        constructor() {
            this.gameEvtMgr_ = null;
            this.timedTaskMgr_ = null;
            this.fpsSum_ = 0;
            this.frames_ = 0;
            this.bRecDt_ = false;
            this.bLogined = false;
        }
        init() {
            Laya.stage.frameRate = GameSetting.framerate === 60 ?
                Laya.Stage.FRAME_FAST : Laya.Stage.FRAME_SLOW;
            if (this.gameEvtMgr_ == null)
                this.gameEvtMgr_ = GameEventMgr.instance;
            this.gameEvtMgr_.init();
            if (this.timedTaskMgr_ == null)
                this.timedTaskMgr_ = TimedTaskMgr.instance;
            this.timedTaskMgr_.clear();
            AudioMgr.instance.init();
            if (GameSetting.debug == 1)
                GameStorage.clearAllStorage();
            this.loadData();
            if (G.isWeChat) {
                let sucCb = this._loginSucc.bind(this);
                let failCb = this._loginFail.bind(this);
                let errCb = this._loginError.bind(this);
                if (GameSetting.openId && GameSetting.openId != '' && GameSetting.openId != 'null' &&
                    GameSetting.payment === 0) {
                    this._loginSucc(null);
                }
                else {
                    WxUtil.login(sucCb, failCb, errCb, true);
                }
                let forwardCb = function () {
                    let msg = DataHub.getMessage;
                    return {
                        title: msg.title,
                        imageUrl: msg.img,
                        query: '',
                    };
                }.bind(this);
                WxUtil.showForward(forwardCb);
                wx.onAudioInterruptionEnd(() => {
                    AudioMgr.instance.stopEffects();
                    AudioMgr.instance.resumeMusic();
                });
            }
            else {
                this.bLogined = true;
                HDSDK.init(GameSetting.openId, GameSetting.proName);
            }
            this._onShow();
            this._onHide();
        }
        start() {
        }
        log() {
        }
        loadData() {
            this.readData();
            WxUtil.readData();
            GameUserInfo.read();
        }
        saveData() {
            let sav = {};
            GameStorage.writeJSON(SaveDef.kGameData, sav);
        }
        readData() {
            let sav = GameStorage.readJSON(SaveDef.kGameData);
            if (G.isExistObj(sav)) ;
        }
        get eventManager() {
            return this.gameEvtMgr_;
        }
        changeScene(scene, lauchedCb) {
            GameEventMgr.instance.clear();
            TimedTaskMgr.instance.clear();
            ResManager.instance.loadScene(scene, () => {
                if (lauchedCb)
                    lauchedCb();
                Laya.Resource.destroyUnusedResources();
            });
            if (G.isWeChat)
                wx.triggerGC();
        }
        clear() {
            GameEventMgr.instance.clear();
            TimedTaskMgr.instance.clear();
            Laya.Resource.destroyUnusedResources();
            if (G.isWeChat)
                wx.triggerGC();
        }
        recordFPS(bVal) {
            if (bVal) {
                this.fpsSum_ = 0;
                this.frames_ = 0;
            }
            this.bRecDt_ = bVal;
        }
        get averageFPS() {
            let ret = 0;
            if (this.frames_ > 0)
                ret = Math.floor((this.fpsSum_ / this.frames_));
            return ret;
        }
        update() {
            let dt = Laya.timer.delta / 1000;
            if (this.gameEvtMgr_)
                this.gameEvtMgr_.excuteEvents();
            if (this.timedTaskMgr_)
                this.timedTaskMgr_.excuteTasks(dt);
            if (this.bRecDt_) {
                if (dt > 0) {
                    let f = 1 / dt;
                    if (f > 60)
                        f = 60;
                    this.fpsSum_ += f;
                }
                ++this.frames_;
            }
        }
        _loginSucc(res) {
            if (res) {
                GameSetting.openId = res.openId;
                GameSetting.sessionKey = res.sessionKey;
                console.log('login succ cb', res);
            }
            else
                console.log('no login succ cb');
            if (GameSetting.openId && GameSetting.openId != '' && GameSetting.openId != 'null' &&
                GameSetting.payment === 0) {
                WxUtil.saveData();
            }
            HDSDK.init(GameSetting.openId, GameSetting.proName);
            WxUtil.launchQueryCheck(kUnionID);
            this.bLogined = true;
        }
        _loginFail(res) {
            GameSetting.sessionKey = '';
            this.bLogined = true;
            console.log('login fail cb', res);
        }
        _loginError(res) {
            this.bLogined = true;
        }
        _onShow() {
            if (G.isWeChat) {
                wx.onShow((res) => {
                    AudioMgr.instance.stopEffects();
                    AudioMgr.instance.resumeMusic();
                    G.log('onShow');
                    let inviteCb = function (res) {
                        G.log('on show invite cb', res);
                    }.bind(this);
                    WxUtil.onShowQueryCheck(res.query, kUnionID);
                    Laya.stage.renderingEnabled = true;
                    Laya.timer.resume();
                    GameUserInfo.calOfflineTime();
                });
            }
        }
        _onHide() {
            if (G.isWeChat) {
                wx.onHide((res) => {
                    Laya.stage.renderingEnabled = false;
                    Laya.timer.pause();
                    AudioMgr.instance.pauseMusic();
                    AudioMgr.instance.stopEffects();
                    GameUserInfo.setOfflineTimestamp();
                    GameUserInfo.saveSignIn();
                });
            }
        }
    }
    GameLogic.instance = new GameLogic();

    var UIHierarchy;
    (function (UIHierarchy) {
        UIHierarchy[UIHierarchy["kDefault"] = 0] = "kDefault";
        UIHierarchy[UIHierarchy["kSetting"] = 994] = "kSetting";
        UIHierarchy[UIHierarchy["kDialog"] = 995] = "kDialog";
        UIHierarchy[UIHierarchy["kCoin"] = 996] = "kCoin";
        UIHierarchy[UIHierarchy["kBlocker"] = 997] = "kBlocker";
        UIHierarchy[UIHierarchy["kTrans"] = 998] = "kTrans";
        UIHierarchy[UIHierarchy["kExportCom"] = 999] = "kExportCom";
        UIHierarchy[UIHierarchy["kExportPage"] = 1000] = "kExportPage";
        UIHierarchy[UIHierarchy["kTip"] = 1001] = "kTip";
        UIHierarchy[UIHierarchy["kTestBnr"] = 1002] = "kTestBnr";
    })(UIHierarchy || (UIHierarchy = {}));
    class BaseUI {
        constructor() {
            this.com_ = null;
            this.id_ = 0;
            this.bLock_ = false;
        }
        init(com) {
        }
        add(parent) {
            if (this.com_) {
                parent.addChild(this.com_);
                this.com_.visible = false;
            }
        }
        reset() {
        }
        remove() {
            if (this.com_) {
                this.com_.removeFromParent();
            }
        }
    }
    BaseUI.root = null;

    class TipUI extends BaseUI {
        constructor() {
            super(...arguments);
            this.lbl_ = null;
            this.showTrans_ = null;
        }
        init(com) {
            if (com) {
                this.com_ = com;
                com.setSize(Laya.stage.width, Laya.stage.height);
                this.lbl_ = com.getChild('tipLbl').asTextField;
                this.showTrans_ = com.getTransition("showTrans");
                com.sortingOrder = UIHierarchy.kTip;
                com.visible = false;
                BaseUI.root.addChild(com);
            }
        }
        show(txt) {
            if (this.com_) {
                this.com_.visible = true;
                this.lbl_.text = txt;
                this.showTrans_.stop();
                this.showTrans_.play(G.layaHandler(this, () => { this.com_.visible = false; }));
            }
        }
    }
    TipUI.instance = new TipUI;

    var VFXLevel;
    (function (VFXLevel) {
        VFXLevel[VFXLevel["kLow"] = 1] = "kLow";
        VFXLevel[VFXLevel["kMid"] = 2] = "kMid";
        VFXLevel[VFXLevel["kHigh"] = 3] = "kHigh";
    })(VFXLevel || (VFXLevel = {}));
    var ToggleType;
    (function (ToggleType) {
        ToggleType[ToggleType["kBgm"] = 0] = "kBgm";
        ToggleType[ToggleType["kSfx"] = 1] = "kSfx";
        ToggleType[ToggleType["kHighFx"] = 2] = "kHighFx";
        ToggleType[ToggleType["kMidFx"] = 3] = "kMidFx";
        ToggleType[ToggleType["kLowFx"] = 4] = "kLowFx";
    })(ToggleType || (ToggleType = {}));
    class SettingUI extends BaseUI {
        constructor() {
            super(...arguments);
            this.bgmToggle_ = null;
            this.sfxToggle_ = null;
            this.highFxRadio_ = null;
            this.midFxRadio_ = null;
            this.lowFxRadio_ = null;
            this.backBtn_ = null;
            this.homeBtn_ = null;
            this.openTrans_ = null;
            this.closeTrans_ = null;
            this.closeCb_ = null;
            this.vfxLv_ = VFXLevel.kMid;
            this.bVfx_ = false;
            this.bGame_ = false;
        }
        get VFXLvl() {
            return this.vfxLv_;
        }
        set VFXLvl(val) {
            this.vfxLv_ = val;
            this._save();
        }
        init(com) {
            if (com) {
                this.com_ = com;
                com.setSize(Laya.stage.width, Laya.stage.height);
                this.bgmToggle_ = com.getChild('bgmToggle').asButton;
                this.sfxToggle_ = com.getChild('sfxToggle').asButton;
                this.highFxRadio_ = com.getChild('fxHighRadio').asButton;
                this.midFxRadio_ = com.getChild('fxMidRadio').asButton;
                this.lowFxRadio_ = com.getChild('fxLowRadio').asButton;
                this.backBtn_ = com.getChild('backBtn').asButton;
                this.homeBtn_ = com.getChild('homeBtn').asButton;
                this.openTrans_ = com.getTransition('openTrans');
                this.closeTrans_ = com.getTransition('closeTrans');
                this.bgmToggle_.selected = !AudioMgr.instance.isStopMusic();
                this.sfxToggle_.selected = !AudioMgr.instance.isStopSound();
                fgui.GRoot.inst.volumeScale = this.sfxToggle_.selected ? 1 : 0;
                this._read();
                this.bgmToggle_.on(fgui.Events.STATE_CHANGED, this, this._onToggleChange, [ToggleType.kBgm]);
                this.sfxToggle_.on(fgui.Events.STATE_CHANGED, this, this._onToggleChange, [ToggleType.kSfx]);
                this.highFxRadio_.on(fgui.Events.STATE_CHANGED, this, this._onToggleChange, [ToggleType.kHighFx]);
                this.midFxRadio_.on(fgui.Events.STATE_CHANGED, this, this._onToggleChange, [ToggleType.kMidFx]);
                this.lowFxRadio_.on(fgui.Events.STATE_CHANGED, this, this._onToggleChange, [ToggleType.kLowFx]);
                this.backBtn_.onClick(this, this._onClose);
                this.homeBtn_.onClick(this, this._onHome);
                com.sortingOrder = UIHierarchy.kSetting;
                com.visible = false;
                BaseUI.root.addChild(com);
            }
        }
        show(openCb, closeCb, bGame = false) {
            if (this.com_) {
                this.com_.visible = true;
                this.bVfx_ = false;
                this.homeBtn_.visible = bGame;
                this.bLock_ = true;
                this.openTrans_.play(G.layaHandler(this, () => {
                    this.bLock_ = false;
                    if (openCb) {
                        openCb();
                    }
                }));
                let ctrl = this.com_.getController('FxRadioGroup');
                if (this.vfxLv_ === 3)
                    ctrl.selectedIndex = 0;
                else if (this.vfxLv_ === 2)
                    ctrl.selectedIndex = 1;
                else if (this.vfxLv_ === 1)
                    ctrl.selectedIndex = 2;
                this.bGame_ = bGame;
                this.closeCb_ = closeCb;
            }
        }
        _onToggleChange(t) {
            if (this.bLock_)
                return;
            switch (t) {
                case ToggleType.kBgm:
                    AudioMgr.instance.setIfMuteMusic(!this.bgmToggle_.selected);
                    break;
                case ToggleType.kSfx:
                    AudioMgr.instance.setIfMuteSound(!this.sfxToggle_.selected);
                    fgui.GRoot.inst.volumeScale = this.sfxToggle_.selected ? 1 : 0;
                    break;
                case ToggleType.kHighFx:
                    this.vfxLv_ = VFXLevel.kHigh;
                    this.bVfx_ = true;
                    break;
                case ToggleType.kMidFx:
                    this.vfxLv_ = VFXLevel.kMid;
                    this.bVfx_ = true;
                    break;
                case ToggleType.kLowFx:
                    this.vfxLv_ = VFXLevel.kLow;
                    this.bVfx_ = true;
                    break;
            }
        }
        _onClose() {
            if (this.bLock_)
                return;
            if (this.com_) {
                this._save();
                if (this.closeCb_)
                    this.closeCb_();
                GameEventMgr.instance.addEvent(EventType.kAdjustVfxLv, null, { lv: this.vfxLv_ });
                if (!this.bGame_) {
                    this.closeTrans_.play(G.layaHandler(this, () => {
                        this.com_.visible = false;
                    }));
                }
                else {
                    if (this.bVfx_)
                        TipUI.instance.show('游戏中仅部分特效设置生效');
                    this.com_.visible = false;
                }
            }
        }
        _onHome() {
            if (this.bLock_)
                return;
            this._onClose();
        }
        _save() {
            let sav = {
                effLv: this.vfxLv_
            };
            GameStorage$1.writeJSON(SaveDef$1.kSetting, sav);
        }
        _read() {
            let sav = GameStorage$1.readJSON(SaveDef$1.kSetting);
            if (sav) {
                this.vfxLv_ = sav.effLv;
            }
            else
                this.vfxLv_ = VFXLevel.kMid;
        }
    }
    SettingUI.instance = new SettingUI();

    class PopupUI extends BaseUI {
        constructor() {
            super(...arguments);
            this.lbl_ = null;
        }
        init(com) {
            if (com) {
                this.com_ = com;
                this.lbl_ = com.getChild('txtLbl').asTextField;
            }
        }
        show(txt) {
            if (this.com_) {
                this.lbl_.text = txt;
                this.com_.setSize(this.lbl_.actualWidth + 20, this.lbl_.actualHeight + 20);
                fgui.GRoot.inst.showPopup(this.com_);
            }
        }
    }
    PopupUI.instance = new PopupUI;

    class InputBlocker extends BaseUI {
        constructor() {
            super(...arguments);
            this.bg_ = null;
            this.rotTrans_ = null;
            this.taskId_ = 0;
        }
        init(com) {
            if (com) {
                this.com_ = com;
                com.setSize(Laya.stage.width, Laya.stage.height);
                this.bg_ = com.getChild("bg").asImage;
                this.rotTrans_ = com.getTransition('rot');
                com.sortingOrder = UIHierarchy.kBlocker;
                com.visible = false;
                BaseUI.root.addChild(com);
            }
        }
        block(time = 3, bShowBg = false) {
            if (this.com_) {
                this.com_.visible = true;
                if (this.bg_) {
                    this.bg_.visible = bShowBg;
                }
                this.rotTrans_.play(null, -1);
                if (this.taskId_ > 0) {
                    TimedTaskMgr.instance.remove(this.taskId_);
                    this.taskId_ = 0;
                }
                this.taskId_ = TimedTaskMgr.instance.add(() => {
                    this.hide();
                }, time);
            }
        }
        hide() {
            if (this.com_) {
                if (this.taskId_ > 0) {
                    TimedTaskMgr.instance.remove(this.taskId_);
                    this.taskId_ = 0;
                }
                this.rotTrans_.stop();
                this.com_.visible = false;
                this.taskId_ = 0;
            }
        }
    }
    InputBlocker.instance = new InputBlocker;

    class HDVideoAd {
        static watchOrShare(id, succCb, succPara, failCb) {
            this.succCallback_ = succCb;
            this.failCallback_ = failCb;
            if (GameUserInfo.isVideoLimited) {
                TipUI.instance.show('今日视频已达上限');
            }
            else {
                let sucCb = () => {
                    InputBlocker.instance.hide();
                    if (this.succCallback_) {
                        this.succCallback_(succPara);
                        this.succCallback_ = null;
                    }
                };
                let closeCb = () => {
                    InputBlocker.instance.hide();
                    if (this.failCallback_) {
                        this.failCallback_();
                        this.failCallback_ = null;
                    }
                    TipUI.instance.show('请观看完整视频获取奖励');
                };
                let errCb = () => {
                    TipUI.instance.show('今日视频已达上限');
                    InputBlocker.instance.hide();
                    if (this.failCallback_) {
                        this.failCallback_();
                        this.failCallback_ = null;
                    }
                    GameUserInfo.limitVideo();
                };
                InputBlocker.instance.block(10);
                WxUtil.watchVideoAds(id, sucCb, closeCb, errCb);
            }
        }
    }
    HDVideoAd.kSignIn = 'adunit-173c5e5d35b44266';
    HDVideoAd.kBox = 'adunit-d1fdb8baaf15e4cd';
    HDVideoAd.kResult = 'adunit-9eda1e1302d3932b';
    HDVideoAd.kTry = 'adunit-090b55dfa38539f5';
    HDVideoAd.kRevive = 'adunit-3e1ae1a358f740cf';
    HDVideoAd.succCallback_ = null;
    HDVideoAd.failCallback_ = null;

    class SignInItem {
        constructor() {
            this.self = null;
            this.dayLbl = null;
            this.iconLoader = null;
            this.cntLbl = null;
            this.maskGrp = null;
        }
    }
    const kMaxItems = 7;
    class SignInUI extends BaseUI {
        constructor() {
            super(...arguments);
            this.awardBtn_ = null;
            this.closeBtn_ = null;
            this.awardCtrl_ = null;
            this.boxCom_ = null;
            this.items_ = [];
            this.showTrans_ = null;
            this.closeTrans_ = null;
            this.bInited_ = false;
            this.bAwarded_ = false;
        }
        init(com) {
            if (com) {
                this.com_ = com;
                this.awardBtn_ = com.getChild('awardBtn').asButton;
                this.closeBtn_ = com.getChild('closeBtn').asButton;
                this.awardCtrl_ = this.awardBtn_.getController('sh');
                this.showTrans_ = com.getTransition('showTrans');
                this.closeTrans_ = com.getTransition('closeTrans');
                for (let i = 0; i < kMaxItems; ++i) {
                    let item = new SignInItem();
                    let obj = com.getChild('item' + (i + 1)).asButton;
                    if (obj) {
                        item.self = obj;
                        item.dayLbl = obj.getChild('dayLbl').asTextField;
                        item.iconLoader = obj.getChild('iconLoader').asLoader;
                        item.cntLbl = obj.getChild('cntLbl').asTextField;
                        item.maskGrp = obj.getChild('maskGrp').asGroup;
                        this.items_.push(item);
                    }
                }
                this.com_.visible = false;
            }
        }
        show() {
            if (this.com_) {
                this.com_.visible = true;
                if (GameUserInfo.isSignInAwarded) {
                    this.awardBtn_.grayed = true;
                    this.bAwarded_ = true;
                }
                else {
                    this.awardBtn_.grayed = false;
                    this.bAwarded_ = false;
                }
                if (this.awardCtrl_)
                    this.awardCtrl_.selectedIndex = GameUserInfo.isVideoLimited ? 1 : 0;
                if (!this.bInited_ || GameUserInfo.isSignIn7Days) {
                    GameUserInfo.signInAwards.each((i, k, info) => {
                        let item = this.items_[i];
                        if (item) {
                            item.dayLbl.text = (i + 1).toString();
                            let t = info.type;
                            if (t === BonusType.kCoin)
                                item.iconLoader.url = 'ui://CommUI/coin';
                            else if (t >= BonusType.kPiece1 && t <= BonusType.kPiece3)
                                item.iconLoader.url = 'ui://CommUI/piece' + (t - BonusType.kPiece1 + 1);
                            item.cntLbl.text = 'x' + info.count;
                            item.maskGrp.visible = i < GameUserInfo.dailyDat.signInAwardCnt ? true : false;
                            item.self.onClick(this, this._onItemClick, [i]);
                        }
                    });
                    this.bInited_ = true;
                }
                this.awardBtn_.onClick(this, this._onAward);
                this.closeBtn_.onClick(this, this._onClose);
                this.bLock_ = true;
                this.showTrans_.stop();
                this.showTrans_.play(G.layaHandler(this, () => {
                    this.bLock_ = false;
                }));
            }
        }
        reset() {
            this.com_.visible = false;
            this.bLock_ = false;
            this.awardBtn_.offClick(this, this._onAward);
            this.closeBtn_.offClick(this, this._onClose);
        }
        _onItemClick(idx) {
            let item = this.items_[idx];
            if (item) {
                let info = GameUserInfo.signInAwards.getByIndex(idx);
                PopupUI.instance.show(info.desc);
            }
        }
        _onAward() {
            if (this.bLock_)
                return;
            if (this.bAwarded_) {
                this._onClose();
                return;
            }
            if (G.isWeChat) {
                HDVideoAd.watchOrShare(HDVideoAd.kSignIn, this._getAward.bind(this));
                if (this.awardCtrl_)
                    this.awardCtrl_.selectedIndex = GameUserInfo.isVideoLimited ? 1 : 0;
            }
            else {
                this._getAward();
            }
        }
        _onClose() {
            if (this.bLock_)
                return;
            GameEventMgr.instance.addEvent(EventType.kRedPoint, null, { type: 1 });
            GameUserInfo.saveProp();
            GameUserInfo.saveSignIn();
            this.bLock_ = true;
            this.closeTrans_.play(G.layaHandler(this, () => { this.reset(); }));
        }
        _getAward() {
            this.bAwarded_ = true;
            this.awardBtn_.grayed = true;
            AudioMgr.instance.playSound(SfxType.kGoodClick);
            let info = GameUserInfo.signInAwards.getByIndex(GameUserInfo.dailyDat.signInAwardCnt);
            let t = info.type;
            if (t === BonusType.kCoin) {
                TipUI.instance.show('获得金币×' + info.count + '！');
            }
            else if (t >= BonusType.kPiece1 && t <= BonusType.kPiece3)
                TipUI.instance.show('获得碎片' + (t - BonusType.kPiece1 + 1) + '×' + info.count);
            this.items_[GameUserInfo.dailyDat.signInAwardCnt].maskGrp.visible = true;
            GameUserInfo.dailyDat.signInAwarded = 1;
            ++GameUserInfo.dailyDat.signInTotalCnt;
            ++GameUserInfo.dailyDat.signInAwardCnt;
            GameUserInfo.saveSignIn();
            GameUserInfo.saveProp();
        }
        _boxOpened() {
            TipUI.instance.show('获得宝箱奖励！');
            GameUserInfo.saveProp();
        }
    }

    const kTips = [
        '小心不要碰到礁石',
        '加速滑板能让你变得更快',
        '尽量避开障碍',
        '不要在背后撞到对手',
        '空中调整方向很困难',
        '冲刺状态下撞到障碍不会减速',
        '复活后能够无敌一小段时间'
    ];
    class TransUI extends BaseUI {
        constructor() {
            super(...arguments);
            this.lbl_ = null;
            this.loader_ = null;
            this.showTrans_ = null;
            this.closeTrans_ = null;
            this.rotTrans_ = null;
            this.callbackOver_ = null;
            this.taskId_ = 0;
            this.bTrans_ = false;
        }
        init(com) {
            if (com) {
                this.com_ = com;
                com.setSize(Laya.stage.width, Laya.stage.height);
                this.lbl_ = com.getChild('txtLbl').asTextField;
                this.loader_ = com.getChild('imgLoader').asLoader;
                this.showTrans_ = com.getTransition("showTrans");
                this.closeTrans_ = com.getTransition('closeTrans');
                this.rotTrans_ = com.getTransition('rotTrans');
                com.sortingOrder = UIHierarchy.kTrans;
                com.visible = false;
                BaseUI.root.addChild(com);
            }
        }
        show(overCb, bSkip = false) {
            if (this.com_) {
                this.com_.visible = true;
                AudioMgr.instance.stopMusic();
                this.callbackOver_ = overCb;
                if (bSkip) {
                    this.loader_.visible = false;
                    this.lbl_.visible = false;
                }
                else {
                    this.loader_.visible = true;
                    this.lbl_.visible = true;
                    this.lbl_.text = kTips[G.randRange(0, kTips.length - 1)];
                    if (this.taskId_ > 0) {
                        TimedTaskMgr.instance.remove(this.taskId_);
                        this.taskId_ = 0;
                    }
                }
                this.showTrans_.play(G.layaHandler(this, this._showOver));
                this.rotTrans_.play(null, -1);
                this.bTrans_ = true;
            }
        }
        over(delay = 0, overCb = null) {
            if (this.bTrans_) {
                if (delay > 0) {
                    this.taskId_ = TimedTaskMgr.instance.add(() => {
                        if (overCb)
                            overCb();
                        this._close();
                    }, delay);
                }
                else {
                    if (overCb)
                        overCb();
                    this._close();
                }
            }
            else {
                if (overCb)
                    overCb();
            }
        }
        reset() {
            if (this.com_) {
                this.rotTrans_.stop();
                this.com_.visible = false;
                this.bTrans_ = false;
            }
        }
        _showOver() {
            if (this.callbackOver_) {
                this.callbackOver_();
                this.callbackOver_ = null;
            }
        }
        _close() {
            this.closeTrans_.play(G.layaHandler(this, this.reset));
        }
    }
    TransUI.instance = new TransUI;

    class BaseWireframe {
        constructor() {
            this.vertices_ = [];
            this.color_ = Laya.Color.GREEN;
            this.pls_ = null;
        }
        show(parent) {
            if (this.pls_ && this.pls_.parent == null)
                parent.addChild(this.pls_);
        }
        hide() {
            if (this.pls_)
                this.pls_.removeSelf();
        }
        destroy() {
            if (this.pls_)
                this.pls_.destroy(true);
        }
    }
    class LineWireframe extends BaseWireframe {
        constructor(v1, v2, tag, color = null) {
            super();
            this.color_ = color || Laya.Color.GREEN;
            this.pls_ = new Laya.PixelLineSprite3D(12, tag + '_lwf');
            this.pls_.addLine(v1, v2, this.color_, this.color_);
        }
        update(v1, v2, color = null) {
            if (color)
                this.color_ = color;
            this.pls_.setLine(0, v1, v2, this.color_, this.color_);
        }
    }
    class RectXZWireframe extends BaseWireframe {
        constructor(r, tag, color = null, y = 0) {
            super();
            this.indices_ = [];
            this.r_ = null;
            this.color_ = color || Laya.Color.GREEN;
            let a = new Laya.Vector3(r.x, y, r.y);
            let b = new Laya.Vector3(r.right, y, r.y);
            let c = new Laya.Vector3(r.right, y, r.bottom);
            let d = new Laya.Vector3(r.x, y, r.bottom);
            this.r_ = r;
            this.vertices_.push(a);
            this.vertices_.push(b);
            this.vertices_.push(c);
            this.vertices_.push(d);
            this.indices_ = [0, 1, 0, 3, 1, 2, 2, 3];
            this.pls_ = new Laya.PixelLineSprite3D(12, tag + '_rxzwf');
            for (let i = 0; i < this.indices_.length; i += 2) {
                let p1 = this.indices_[i] ? this.vertices_[this.indices_[i]] : this.vertices_[0];
                let p2 = this.indices_[i + 1] ? this.vertices_[this.indices_[i + 1]] : this.vertices_[0];
                this.pls_.addLine(p1, p2, this.color_, this.color_);
            }
        }
        update(color = null, y = 0) {
            if (this.pls_) {
                if (color)
                    this.color_ = color;
                let r = this.r_;
                this.vertices_[0].setValue(r.x, y, r.y);
                this.vertices_[1].setValue(r.right, y, r.y);
                this.vertices_[2].setValue(r.right, y, r.bottom);
                this.vertices_[3].setValue(r.x, y, r.bottom);
                let idx = 0;
                for (let i = 0; i < this.indices_.length; i += 2) {
                    let p1 = this.indices_[i] ? this.vertices_[this.indices_[i]] : this.vertices_[0];
                    let p2 = this.indices_[i + 1] ? this.vertices_[this.indices_[i + 1]] : this.vertices_[0];
                    this.pls_.setLine(idx++, p1, p2, this.color_, this.color_);
                }
            }
        }
    }
    class BoxWireframe extends BaseWireframe {
        constructor(box, tag, color = null) {
            super();
            this.indices_ = [];
            this.bb_ = null;
            this.color_ = color || Laya.Color.GREEN;
            let bb = box;
            let a = bb.getMin();
            let b = new Laya.Vector3(bb.getMin().x, bb.getMax().y, bb.getMin().z);
            let c = new Laya.Vector3(bb.getMin().x, bb.getMin().y, bb.getMax().z);
            let d = new Laya.Vector3(bb.getMax().x, bb.getMin().y, bb.getMin().z);
            let e = new Laya.Vector3(bb.getMin().x, bb.getMax().y, bb.getMax().z);
            let f = new Laya.Vector3(bb.getMax().x, bb.getMax().y, bb.getMin().z);
            let g = new Laya.Vector3(bb.getMax().x, bb.getMin().y, bb.getMax().z);
            let h = bb.getMax();
            this.bb_ = bb;
            this.vertices_.push(a);
            this.vertices_.push(b);
            this.vertices_.push(c);
            this.vertices_.push(d);
            this.vertices_.push(e);
            this.vertices_.push(f);
            this.vertices_.push(g);
            this.vertices_.push(h);
            this.indices_ = [0, 1, 0, 2, 0, 3, 1, 4, 1, 5, 7, 4, 7, 5, 7, 6, 6, 2, 6, 3, 2, 4, 3, 5];
            this.pls_ = new Laya.PixelLineSprite3D(12, tag + '_bwf');
            for (let i = 0; i < this.indices_.length; i += 2) {
                let p1 = this.indices_[i] ? this.vertices_[this.indices_[i]] : this.vertices_[0];
                let p2 = this.indices_[i + 1] ? this.vertices_[this.indices_[i + 1]] : this.vertices_[0];
                this.pls_.addLine(p1, p2, this.color_, this.color_);
            }
        }
        update(color = null) {
            if (this.pls_) {
                if (color)
                    this.color_ = color;
                let bb = this.bb_;
                this.vertices_[0] = bb.getMin();
                this.vertices_[1].setValue(bb.getMin().x, bb.getMax().y, bb.getMin().z);
                this.vertices_[2].setValue(bb.getMin().x, bb.getMin().y, bb.getMax().z);
                this.vertices_[3].setValue(bb.getMax().x, bb.getMin().y, bb.getMin().z);
                this.vertices_[4].setValue(bb.getMin().x, bb.getMax().y, bb.getMax().z);
                this.vertices_[5].setValue(bb.getMax().x, bb.getMax().y, bb.getMin().z);
                this.vertices_[6].setValue(bb.getMax().x, bb.getMin().y, bb.getMax().z);
                this.vertices_[7] = bb.getMax();
                let idx = 0;
                for (let i = 0; i < this.indices_.length; i += 2) {
                    let p1 = this.indices_[i] ? this.vertices_[this.indices_[i]] : this.vertices_[0];
                    let p2 = this.indices_[i + 1] ? this.vertices_[this.indices_[i + 1]] : this.vertices_[0];
                    this.pls_.setLine(idx++, p1, p2, this.color_, this.color_);
                }
            }
        }
    }
    class HDDebugTools {
        static drawBoxWireframe(box, tag, parent, color = null) {
            let bwf = null;
            if (this.wireframeMap_.containsKey(tag)) {
                bwf = this.wireframeMap_.get(tag);
                bwf.update(color);
            }
            else {
                bwf = new BoxWireframe(box, tag, color);
                this.wireframeMap_.put(tag, bwf);
            }
            if (bwf)
                bwf.show(parent);
        }
        static drawLineWireframe(v1, v2, tag, parent = null, color = null) {
            let lwf = null;
            if (this.wireframeMap_.containsKey(tag)) {
                lwf = this.wireframeMap_.get(tag);
                lwf.update(v1, v2, color);
            }
            else {
                lwf = new LineWireframe(v1, v2, tag, color);
                this.wireframeMap_.put(tag, lwf);
            }
            if (lwf)
                lwf.show(parent);
        }
        static drawRectXZWireframe(rect, tag, parent = null, color = null, y = 0) {
            let rwf = null;
            if (this.wireframeMap_.containsKey(tag)) {
                rwf = this.wireframeMap_.get(tag);
                rwf.update(color);
            }
            else {
                rwf = new RectXZWireframe(rect, tag, color, y);
                this.wireframeMap_.put(tag, rwf);
            }
            if (rwf)
                rwf.show(parent);
        }
        static hideWireframe(tag) {
            if (this.wireframeMap_.containsKey(tag)) {
                let wf = this.wireframeMap_.get(tag);
                wf.hide();
            }
        }
        static removeWireframe(tag) {
            if (this.wireframeMap_.containsKey(tag)) {
                let wf = this.wireframeMap_.get(tag);
                wf.destroy();
                this.wireframeMap_.remove(tag);
            }
        }
        static drawCylinderXZ(tag, radius, height, refObj, y = 0, slices = 32) {
            let cylinder = null;
            if (this.primitiveBoundMap_.containsKey(tag)) {
                cylinder = this.primitiveBoundMap_.get(tag);
                cylinder.transform.localPositionY = y;
            }
            else {
                cylinder = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createCylinder(radius, height, slices));
                cylinder.transform.localPositionY = y;
                this.primitiveBoundMap_.put(tag, cylinder);
            }
            if (cylinder && !cylinder.parent)
                refObj.addChild(cylinder);
        }
        static hidePrimitive(tag) {
            if (this.primitiveBoundMap_.containsKey(tag)) {
                let pr = this.primitiveBoundMap_.get(tag);
                pr.removeSelf();
            }
        }
        static removePrimitive(tag) {
            if (this.primitiveBoundMap_.containsKey(tag)) {
                let pr = this.primitiveBoundMap_.get(tag);
                pr.destroy(true);
                this.primitiveBoundMap_.remove(tag);
            }
        }
    }
    HDDebugTools.wireframeMap_ = new HDMap();
    HDDebugTools.primitiveBoundMap_ = new HDMap();

    class MathHelper {
        static clamp(input, min, max) {
            return Math.max(Math.min(input, max), min);
        }
    }

    class SegInterResult {
        constructor(p, v1, v2) {
            this.point = null;
            this.vertex1 = null;
            this.vertex2 = null;
            this.point = p.copy(p);
            this.vertex1 = v1.copy(v1);
            this.vertex2 = v2.copy(v2);
        }
    }
    class HDCircle {
        constructor(cx, cy, radius) {
            this.x = 0;
            this.y = 0;
            this.radius = 0;
            this.tag = '';
            this.x = cx;
            this.y = cy;
            this.radius = radius;
        }
    }
    class GeomtryHelper {
        static getBoundingBox(sp3d, sclX = 1, sclY = 1, sclZ = 1) {
            if (sclX === 1 && sclY === 1 && sclZ === 1) {
                return sp3d.meshRenderer.bounds;
            }
            else {
                let origBb = sp3d.meshRenderer.bounds;
                let center = origBb.getCenter();
                let extent = origBb.getExtent();
                extent.x *= sclX;
                extent.y *= sclY;
                extent.z *= sclZ;
                let bb = new Laya.Bounds(new Laya.Vector3(), new Laya.Vector3());
                bb.setCenter(center);
                bb.setExtent(extent);
                return bb;
            }
        }
        static convertBound2RectXZ(sp3d, sclX = 1, sclZ = 1) {
            let bb = this.getBoundingBox(sp3d, sclX, 1, sclZ);
            let ret = new Laya.Rectangle();
            ret.x = bb.getMin().x;
            ret.y = bb.getMin().z;
            ret.width = Math.abs(bb.getMax().x - ret.x);
            ret.height = Math.abs(bb.getMax().z - ret.y);
            return ret;
        }
        static convertBound2CircleXZ(sp3d, sclXZ = 1) {
            let bb = this.getBoundingBox(sp3d, sclXZ, 1, sclXZ);
            let center = bb.getCenter();
            let dx = bb.getMax().x - bb.getMin().x;
            let dz = bb.getMax().z - bb.getMin().z;
            let rad = Math.sqrt(dz * dz + dx * dx) / 2;
            return new HDCircle(center.x, center.z, rad);
        }
        static getRectXZVertices(rect, out) {
            out[0].x = rect.x;
            out[0].y = rect.y;
            out[1].x = rect.right;
            out[1].y = rect.y;
            out[2].x = rect.right;
            out[2].y = rect.bottom;
            out[3].x = rect.x;
            out[3].y = rect.bottom;
        }
        static isParallelVec2D(v1, v2) {
            let n1 = new Laya.Vector2();
            Laya.Vector2.normalize(v1, n1);
            let n2 = new Laya.Vector2();
            Laya.Vector2.normalize(v2, n2);
            let num = Laya.Vector2.dot(n1, n2);
            if (G.isEqualF(Math.abs(num), 1))
                return true;
            return false;
        }
        static isParallelVec3D(v1, v2) {
            let n1 = new Laya.Vector3();
            Laya.Vector3.normalize(v1, n1);
            let n2 = new Laya.Vector3();
            Laya.Vector3.normalize(v2, n2);
            let num = Laya.Vector3.dot(n1, n2);
            if (G.isEqualF(Math.abs(num), 1))
                return true;
            return false;
        }
        static isPointOnSegment2D(p1, p2, q) {
            let crossProd1 = (q.x - p1.x) * (p2.y - p1.y);
            let crossProd2 = (p2.x - p1.x) * (q.y - p1.y);
            let ret = G.isEqualF(crossProd1, crossProd2) &&
                Math.min(p1.x, p2.x) <= q.x && Math.max(p1.x, p1.x) >= q.x &&
                Math.min(p1.y, p2.y) <= q.y && Math.max(p1.y, p2.y) >= q.y;
            return ret;
        }
        static intersectSeg2Seg2D(a, b, c, d) {
            let areaABC = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
            let areaABD = (a.x - d.x) * (b.y - d.y) - (a.y - d.y) * (b.x - d.x);
            if (areaABC * areaABD >= 0) {
                return null;
            }
            let areaCDA = (c.x - a.x) * (d.y - a.y) - (c.y - a.y) * (d.x - a.x);
            let areaCDB = areaCDA + areaABC - areaABD;
            if (areaCDA * areaCDB >= 0) {
                return null;
            }
            let t = areaCDA / (areaABD - areaABC);
            let dx = t * (b.x - a.x), dy = t * (b.y - a.y);
            return new Laya.Point(a.x + dx, a.y + dy);
        }
        static intersectSeg2Rect2D(a, b, rect) {
            let ret = [];
            this.getRectXZVertices(rect, this.pnts_);
            for (let i = 0; i < this.indices_.length; i += 2) {
                let p1 = this.indices_[i] ? this.pnts_[this.indices_[i]] : this.pnts_[0];
                let p2 = this.indices_[i + 1] ? this.pnts_[this.indices_[i + 1]] : this.pnts_[0];
                let p = this.intersectSeg2Seg2D(a, b, p1, p2);
                if (p) {
                    let res = new SegInterResult(p, p1, p2);
                    ret.push(res);
                }
            }
            return ret;
        }
        static intersectLine2Circle2D(p1, p2, circle, bSeg = false) {
            let ret = [];
            let dx = p2.x - p1.x;
            let dy = p2.y - p1.y;
            let p1cx = p1.x - circle.x;
            let p1cy = p1.y - circle.y;
            let A = dx * dx + dy * dy;
            let B = 2 * (dx * p1cx + dy * p1cy);
            let C = p1cx * p1cx + p1cy * p1cy - circle.radius * circle.radius;
            let delta = B * B - 4 * A * C;
            if (A <= 0.0000001 || delta < 0) ;
            else if (delta === 0) {
                let t = -B / (2 * A);
                if (bSeg) {
                    if (t >= 0 && t <= 1) {
                        ret[0] = new Laya.Point(p1.x + t * dx, p1.y + t * dy);
                    }
                }
                else
                    ret[0] = new Laya.Point(p1.x + t * dx, p1.y + t * dy);
            }
            else {
                let t1 = (-B + Math.sqrt(delta)) / (2 * A);
                let t2 = (-B - Math.sqrt(delta)) / (2 * A);
                if (bSeg) {
                    if (t1 < 0 && t2 < 0 || t1 > 1 && t2 > 1) ;
                    else if (t1 < 0 && t2 > 1 || t1 > 1 && t2 < 0) ;
                    else if (t1 >= 0 && t1 <= 1 && (t2 < 0 || t2 > 1)) {
                        ret[0] = new Laya.Point(p1.x + t1 * dx, p1.y + t1 * dy);
                    }
                    else if (t2 >= 0 && t2 <= 1 && (t1 < 0 || t1 > 1)) {
                        ret[0] = new Laya.Point(p1.x + t2 * dx, p1.y + t2 * dy);
                    }
                    else if (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1) {
                        ret[0] = new Laya.Point(p1.x + t1 * dx, p1.y + t1 * dy);
                        ret[1] = new Laya.Point(p1.x + t2 * dx, p1.y + t2 * dy);
                    }
                }
                else {
                    ret[0] = new Laya.Point(p1.x + t1 * dx, p1.y + t1 * dy);
                    ret[1] = new Laya.Point(p1.x + t2 * dx, p1.y + t2 * dy);
                }
            }
            return ret;
        }
        static intersectSeg2Circle2D(p1, p2, circle) {
            return this.intersectLine2Circle2D(p1, p2, circle, true);
        }
    }
    GeomtryHelper.pnts_ = [
        new Laya.Point(),
        new Laya.Point(),
        new Laya.Point(),
        new Laya.Point(),
    ];
    GeomtryHelper.indices_ = [0, 1, 0, 3, 1, 2, 2, 3];

    class Stage extends Laya.Script3D {
        constructor() {
            super(...arguments);
            this.cam_ = null;
            this.touchPos_ = new Laya.Vector2();
            this.ray_ = new Laya.Ray(new Laya.Vector3(), new Laya.Vector3());
            this.tree_ = null;
            this.treeSclTimer_ = 0;
            this.rocks_ = [];
            this.float_ = null;
            this.stick1_ = null;
            this.stick2_ = null;
            this.circles_ = [];
            this.sea_ = null;
            this.horVecN_ = new Laya.Vector3(1, 0, 0);
            this.verVecN_ = new Laya.Vector3(0, 0, 1);
            this.reflectLine_ = new Laya.Vector3();
            this.bHome_ = false;
            this.bTouched_ = false;
        }
        init() {
            let sc = this.owner;
            sc.enableFog = true;
            sc.fogColor = new Laya.Vector3(0.9, 1, 1);
            sc.fogStart = 6;
            sc.fogRange = 12;
            let cam = this.owner.getChildByName('Main Camera');
            if (cam) {
                cam.clearFlag = Laya.BaseCamera.CLEARFLAG_SKY;
                ResManager.instance.loadMaterial(ResManager.nativePath + '3d/Sky/skyBox.lmat', (mat) => {
                    let skyRenderer = sc.skyRenderer;
                    skyRenderer.mesh = Laya.SkyBox.instance;
                    skyRenderer.material = mat;
                });
                this.cam_ = cam;
                cam.enableHDR = false;
            }
            let hn = sc.getChildByName('homeNode');
            if (hn) {
                let t = hn.getChildByName('tree');
                if (t) {
                    t.transform.scale = new Laya.Vector3(0.5, 0.5, 0.5);
                    HDDebugTools.drawBoxWireframe(t.meshRenderer.bounds, t.name, sc, Laya.Color.RED);
                    this.tree_ = t;
                }
                let u = hn.getChildByName('unbrella');
                if (u) {
                    let bb = GeomtryHelper.getBoundingBox(u, 0.8, 1, 0.8);
                    HDDebugTools.drawBoxWireframe(bb, u.name, sc);
                }
                let stick = hn.getChildByName('stick');
                this.stick1_ = Laya.MeshSprite3D.instantiate(stick);
                this.stick2_ = Laya.MeshSprite3D.instantiate(stick);
                sc.addChild(this.stick1_);
                sc.addChild(this.stick2_);
                for (let i = 0; i < 8; ++i)
                    this.rocks_[i] = hn.getChildByName('rock' + (i + 1));
                this.float_ = hn.getChildByName('blue_float');
            }
            let beach = sc.getChildByName('beach');
            if (beach)
                this.sea_ = beach.getChildByName('sea');
            Laya.stage.addChild(this.owner);
            Laya.stage.setChildIndex(this.owner, 0);
        }
        enterHome() {
            this.bHome_ = true;
            Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this._onTouchBegin);
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this._onTouchMove);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this._onTouchEnd);
            AudioMgr.instance.playMusic(BgmType.kBgmMenu);
        }
        enterGame() {
            this.bHome_ = false;
            if (this.cam_) {
                this.cam_.transform.localRotationEulerX = -90;
                this.cam_.transform.localPositionY = 3;
                this.cam_.transform.localPositionX = -0.5;
                for (let i = 0; i < this.rocks_.length; ++i) {
                    let r = GeomtryHelper.convertBound2RectXZ(this.rocks_[i]);
                    HDDebugTools.drawRectXZWireframe(r, this.rocks_[i].name, this.owner, Laya.Color.MAGENTA);
                    this.circles_[i] = GeomtryHelper.convertBound2CircleXZ(this.rocks_[i], 1);
                    this.circles_[i].tag = this.rocks_[i].name + '_c';
                }
            }
        }
        leaveHome() {
        }
        leaveGame() {
        }
        onUpdate() {
            if (this.bHome_) {
                let dt = Laya.timer.delta / 1000;
                if (this.tree_) {
                    this.treeSclTimer_ += dt;
                    let mul = MathHelper.clamp(1 + Math.cos(this.treeSclTimer_), 0.3, 1.2);
                    this.tree_.transform.localScaleY = mul;
                    this.tree_.transform.localPositionZ += Math.cos(this.treeSclTimer_) * 0.01;
                    HDDebugTools.drawBoxWireframe(this.tree_.meshRenderer.bounds, this.tree_.name, this.owner, Laya.Color.RED);
                }
            }
        }
        _onTouchBegin(e) {
            let t = e.target;
            if ('frameRate' in t) {
                if (this.bHome_) {
                    this.touchPos_.x = Laya.stage.mouseX;
                    this.touchPos_.y = Laya.stage.mouseY;
                    this.cam_.viewportPointToRay(this.touchPos_, this.ray_);
                    this.cam_.transform.lookAt(this.ray_.direction, new Laya.Vector3(0, 1, 0));
                }
                this.bTouched_ = true;
            }
        }
        _onTouchMove(e) {
            if (this.bTouched_) {
                if (!this.bHome_) {
                    this.touchPos_.x = Laya.stage.mouseX;
                    this.touchPos_.y = Laya.stage.mouseY;
                    this.cam_.viewportPointToRay(this.touchPos_, this.ray_);
                    let bb = GeomtryHelper.getBoundingBox(this.sea_);
                    let interV3 = new Laya.Vector3();
                    Laya.CollisionUtils.intersectsRayAndBoxRP(this.ray_, bb._boundBox, interV3);
                    let startPos = new Laya.Vector3(this.float_.transform.position.x, 0, this.float_.transform.position.z);
                    let endPos = new Laya.Vector3(interV3.x, 0, interV3.z);
                    HDDebugTools.drawLineWireframe(startPos, endPos, 'l1', this.owner, Laya.Color.BLUE);
                    for (let i = 0; i < this.circles_.length; ++i) {
                        let pnts = GeomtryHelper.intersectSeg2Circle2D(new Laya.Point(startPos.x, startPos.z), new Laya.Point(endPos.x, endPos.z), this.circles_[i]);
                        if (pnts.length > 0) {
                            console.log('circle inter', this.circles_[i].tag);
                            HDDebugTools.drawCylinderXZ(this.circles_[i].tag, this.circles_[i].radius, 0.01, this.rocks_[i], 0.1);
                            if (pnts.length > 1) {
                                this.stick1_.active = true;
                                this.stick2_.active = true;
                                this.stick1_.transform.position = new Laya.Vector3(pnts[0].x, 0, pnts[0].y);
                                this.stick2_.transform.position = new Laya.Vector3(pnts[1].x, 0, pnts[1].y);
                                break;
                            }
                            else {
                                this.stick1_.active = true;
                                this.stick2_.active = false;
                                this.stick1_.transform.position = new Laya.Vector3(pnts[0].x, 0, pnts[0].y);
                                break;
                            }
                        }
                        else {
                            this.stick1_.active = false;
                            this.stick2_.active = false;
                            HDDebugTools.hidePrimitive(this.circles_[i].tag);
                        }
                    }
                    for (let i = 0; i < this.rocks_.length; ++i) {
                        let rect = GeomtryHelper.convertBound2RectXZ(this.rocks_[i]);
                        let interPnts = GeomtryHelper.intersectSeg2Rect2D(new Laya.Point(startPos.x, startPos.z), new Laya.Point(endPos.x, endPos.z), rect);
                        let interArr = [];
                        for (let i = 0; i < interPnts.length; ++i) {
                            let inter = interPnts[i];
                            interArr.push(inter);
                        }
                        let nearInter = null;
                        if (interArr.length > 0) {
                            if (interArr.length > 1) {
                                let dist = 0;
                                for (let i = 0; i < interArr.length; ++i) {
                                    let d = interArr[i].point.distance(startPos.x, startPos.z);
                                    if (d < dist || dist === 0) {
                                        nearInter = interArr[i];
                                        dist = d;
                                    }
                                }
                            }
                            else {
                                nearInter = interArr[0];
                            }
                        }
                        if (nearInter) {
                            let line = new Laya.Vector3(nearInter.vertex2.x - nearInter.vertex1.x, 0, nearInter.vertex2.y - nearInter.vertex1.y);
                            let rx = 0;
                            let ry = 0;
                            if (GeomtryHelper.isParallelVec3D(line, this.horVecN_)) {
                                rx = 2 * nearInter.point.x - startPos.x;
                                ry = startPos.z;
                            }
                            else {
                                rx = startPos.x;
                                ry = 2 * nearInter.point.y - startPos.z;
                            }
                            this.reflectLine_.setValue(rx - nearInter.point.x, 0, ry - nearInter.point.y);
                            Laya.Vector3.normalize(this.reflectLine_, this.reflectLine_);
                            Laya.Vector3.scale(this.reflectLine_, 0.3, this.reflectLine_);
                            let s = new Laya.Vector3(nearInter.point.x, 0, nearInter.point.y);
                            let e = new Laya.Vector3(rx, 0, ry);
                            HDDebugTools.drawLineWireframe(s, e, this.rocks_[i].name + 'l2', this.owner, Laya.Color.RED);
                        }
                        else {
                            HDDebugTools.hideWireframe(this.rocks_[i].name + 'l2');
                        }
                    }
                }
            }
        }
        _onTouchEnd(e) {
            this.bTouched_ = false;
        }
    }

    var BtnType;
    (function (BtnType) {
        BtnType[BtnType["kStart"] = 0] = "kStart";
        BtnType[BtnType["kSignIn"] = 1] = "kSignIn";
        BtnType[BtnType["kSetting"] = 2] = "kSetting";
        BtnType[BtnType["kBox"] = 3] = "kBox";
    })(BtnType || (BtnType = {}));
    class HomeHUD extends Laya.Script {
        constructor() {
            super(...arguments);
            this.homePnl_ = null;
            this.startBtn_ = null;
            this.signInBtn_ = null;
            this.settingBtn_ = null;
            this.boxBtn_ = null;
            this.showTrans_ = null;
            this.closeTrans_ = null;
            this.settingUI_ = null;
            this.signInUI_ = null;
            this.stage_ = null;
            this.bLocked_ = false;
            this.bFirst_ = false;
            this.bPreloadBnr_ = false;
        }
        onAwake() {
            HomeHUD.instance = this;
            fgui.UIPackage.loadPackage(ResManager.nativePath + "2d/fgui/HomeHUD", G.layaHandler(this, this._onLoadedUI));
        }
        onDestroy() {
        }
        open() {
            this._enter();
        }
        onUpdate() {
        }
        setStartBtnStatus(bTry = false) {
            if (this.startBtn_) {
                this.startBtn_.getController('try').selectedIndex = bTry ? 0 : 1;
            }
        }
        _onLoadedUI() {
            let fguiNode = fgui.GRoot.inst;
            let fguiUP = fgui.UIPackage;
            fguiUP.addPackage(ResManager.nativePath + "2d/fgui/HomeHUD");
            this.homePnl_ = fguiUP.createObject('HomeHUD', 'HomePnl').asCom;
            this.homePnl_.setSize(Laya.stage.width, Laya.stage.height);
            if (this.homePnl_) {
                fguiNode.addChild(this.homePnl_);
                this.homePnl_.visible = false;
                this.startBtn_ = this.homePnl_.getChild('startBtn').asButton;
                this.signInBtn_ = this.homePnl_.getChild('signInBtn').asButton;
                this.settingBtn_ = this.homePnl_.getChild('settingBtn').asButton;
                this.boxBtn_ = this.homePnl_.getChild('freeBoxBtn').asButton;
                this.startBtn_.onClick(this, this._onClick, [BtnType.kStart]);
                this.signInBtn_.onClick(this, this._onClick, [BtnType.kSignIn]);
                this.settingBtn_.onClick(this, this._onClick, [BtnType.kSetting]);
                this.boxBtn_.onClick(this, this._onClick, [BtnType.kBox]);
                this.showTrans_ = this.homePnl_.getTransition('showTrans');
                this.closeTrans_ = this.homePnl_.getTransition('closeTrans');
                this.settingUI_ = SettingUI.instance;
                this.signInUI_ = new SignInUI();
                this.signInUI_.init(this.homePnl_.getChild('signInPnl').asCom);
            }
        }
        _loadedBnr() {
            let sc = ResManager.instance.getScene(ResManager.nativePath + '3d/Stage.ls');
            if (sc) {
                sc.addComponent(Stage);
                let com = sc.getComponent(Stage);
                com.init();
                this.stage_ = com;
                this._enter();
            }
        }
        _enter() {
            if (this.homePnl_ && this.stage_) {
                TransUI.instance.over(0, () => {
                    this.owner.active = true;
                    this.homePnl_.visible = true;
                    this.bPreloadBnr_ = false;
                    this.stage_.enterHome();
                });
            }
        }
        _leave() {
            this.homePnl_.visible = false;
        }
        _onClick(t) {
            if (this.bLocked_)
                return;
            switch (t) {
                case BtnType.kStart:
                    break;
                case BtnType.kSignIn:
                    if (this.signInUI_)
                        this.signInUI_.show();
                    break;
                case BtnType.kSetting:
                    if (this.settingUI_)
                        this.settingUI_.show();
                    break;
            }
        }
        _redPoint(sender, data) {
            if (data) {
                if (data.type === 1)
                    this.signInBtn_.getController('redPnt').selectedIndex = 1;
            }
        }
        _fpsResult() {
            if (this.settingUI_) {
                let avgFps = GameLogic.instance.averageFPS;
                G.log('average FPS', avgFps);
                if (avgFps > 0) {
                    let lv = this.settingUI_.VFXLvl;
                    if (lv == VFXLevel.kHigh) {
                        if (avgFps <= 52) {
                            this.settingUI_.VFXLvl = VFXLevel.kMid;
                        }
                        else if (avgFps <= 45) {
                            this.settingUI_.VFXLvl = VFXLevel.kLow;
                        }
                    }
                    else if (lv == VFXLevel.kMid) {
                        if (avgFps <= 55) {
                            this.settingUI_.VFXLvl = VFXLevel.kLow;
                        }
                        else if (avgFps >= 60) {
                            this.settingUI_.VFXLvl = VFXLevel.kHigh;
                        }
                    }
                    else if (lv == VFXLevel.kLow) {
                        if (avgFps >= 58) {
                            this.settingUI_.VFXLvl = VFXLevel.kMid;
                        }
                    }
                }
            }
        }
        _showPageBnr() {
        }
        _hidePageBnr() {
        }
        _showFoldBnr() {
        }
        _hideFoldBnr() {
        }
    }
    HomeHUD.instance = null;

    class DialogUI extends BaseUI {
        constructor() {
            super(...arguments);
            this.titleLbl_ = null;
            this.contentLbl_ = null;
            this.confirmBtn_ = null;
            this.closeBtn_ = null;
            this.showTrans_ = null;
            this.closeTrans_ = null;
            this.yesCallback_ = null;
            this.noCallback_ = null;
        }
        init(com) {
            if (com) {
                this.com_ = com;
                com.setSize(Laya.stage.width, Laya.stage.height);
                this.titleLbl_ = com.getChild('titleLbl').asTextField;
                this.contentLbl_ = com.getChild('contentLbl').asTextField;
                this.confirmBtn_ = com.getChild('confirmBtn').asButton;
                this.closeBtn_ = com.getChild('closeBtn').asButton;
                this.showTrans_ = com.getTransition("showTrans");
                this.closeTrans_ = com.getTransition('closeTrans');
                com.sortingOrder = UIHierarchy.kDialog;
                com.visible = false;
                BaseUI.root.addChild(com);
            }
        }
        show(title, text, yesCb, noCb, bSingleBtn = false) {
            if (this.com_) {
                this.com_.visible = true;
                this.titleLbl_.text = title;
                this.contentLbl_.text = text;
                this.bLock_ = true;
                this.showTrans_.play(G.layaHandler(this, () => { this.bLock_ = false; }));
                this.confirmBtn_.onClick(this, this._onConfirm);
                this.closeBtn_.onClick(this, this._onClose);
                this.yesCallback_ = yesCb;
                this.noCallback_ = noCb;
                if (bSingleBtn)
                    this.closeBtn_.visible = false;
                else
                    this.closeBtn_.visible = true;
            }
        }
        reset() {
            if (this.com_) {
                this.bLock_ = false;
                this.com_.visible = false;
                this.confirmBtn_.offClick(this, this._onConfirm);
                this.closeBtn_.offClick(this, this._onClose);
                if (this.com_.sortingOrder != UIHierarchy.kDialog)
                    this.renderSortOriginal();
            }
        }
        renderSortTop() {
            if (this.com_)
                this.com_.sortingOrder = UIHierarchy.kTip;
        }
        renderSortOriginal() {
            if (this.com_)
                this.com_.sortingOrder = UIHierarchy.kDialog;
        }
        _onConfirm() {
            if (this.bLock_)
                return;
            if (this.yesCallback_)
                this.yesCallback_();
            this.bLock_ = true;
            this.closeTrans_.play(G.layaHandler(this, this.reset));
        }
        _onClose() {
            if (this.bLock_)
                return;
            if (this.noCallback_)
                this.noCallback_();
            this.bLock_ = true;
            this.closeTrans_.play(G.layaHandler(this, this.reset));
        }
    }
    DialogUI.instance = new DialogUI;

    class Load extends Laya.Script {
        constructor() {
            super(...arguments);
            this.loadPnl_ = null;
            this.loadProg_ = null;
            this.loadBg_ = null;
            this.loadProc_ = 0;
            this.loadTimer_ = 0;
            this.bLoading_ = false;
            this.bLoaded_ = false;
            this.bExcuted_ = false;
            this.bChanged_ = false;
        }
        onStart() {
            GameLogic.instance.init();
            Laya.timer.frameLoop(1, GameLogic.instance, GameLogic.instance.update);
            DataHub.loadJson();
            BaseUI.root = fgui.GRoot.inst;
            Laya.stage.addChild(BaseUI.root.displayObject);
            fgui.UIConfig.packageFileExtension = "bin";
            fgui.UIPackage.loadPackage(ResManager.nativePath + "LoadUI", G.layaHandler(this, this._onLoadingUI));
        }
        _onLoadingUI() {
            fgui.UIPackage.addPackage(ResManager.nativePath + "LoadUI");
            this.loadPnl_ = fgui.UIPackage.createObject('LoadUI', 'Loading').asCom;
            if (this.loadPnl_) {
                BaseUI.root.addChild(this.loadPnl_);
                this.loadPnl_.setSize(Laya.stage.width, Laya.stage.height);
                this.loadBg_ = this.loadPnl_.getChild('bg').asImage;
                this.loadProg_ = this.loadPnl_.getChild('prog').asProgress;
                let bw = this.loadBg_.width;
                let bh = this.loadBg_.height;
                let sh = Laya.stage.height / bh;
                let sv = Laya.stage.width / bw;
                if (sh > sv) {
                    this.loadBg_.width = bw * sh;
                    this.loadBg_.height = bh * sh;
                }
                else {
                    this.loadBg_.width = bw * sv;
                    this.loadBg_.height = bh * sv;
                }
                G.log('loading UI size', this.loadBg_.width, this.loadBg_.height, bw, bh, sh, sv);
            }
            if (G.isWeChat) {
                WxUtil.fetchSdkInfo();
                WxUtil.checkVersionUpdate(this._updateApp.bind(this), this._noUpdate.bind(this));
            }
            this.bLoading_ = true;
            this.loadProc_ = 0;
        }
        _updateApp() {
        }
        _noUpdate() {
        }
        _excuteLoad() {
            ResManager.nativePath = 'res/';
            this.bLoaded_ = true;
            this._addProc(99);
        }
        onUpdate() {
            if (this.bLoading_) {
                if (this.loadProc_ < 40) {
                    let dt = Laya.timer.delta / 1000;
                    this.loadTimer_ -= dt;
                    if (this.loadTimer_ <= 0) {
                        this._addProc(G.randRange(10, 15));
                        this.loadTimer_ = G.randRangeF(0.1, 0.3);
                    }
                }
                else if (this.loadProc_ < 89) {
                    if (!this.bExcuted_) {
                        this._excuteLoad();
                        this.bExcuted_ = true;
                    }
                    else {
                        if (this.loadProc_ < 88)
                            this._addProc(1);
                    }
                }
                else {
                    if (this.bLoaded_ && !this.bChanged_ && DataHub.bJsonLoaded && GameLogic.instance.bLogined) {
                        fgui.UIPackage.loadPackage(ResManager.nativePath + "2d/fgui/CommUI", G.layaHandler(this, this._onLoadCommUI));
                        this.bChanged_ = true;
                    }
                }
            }
        }
        _onLoadCommUI() {
            DataHub.loadBackendConfig();
            fgui.UIPackage.addPackage(ResManager.nativePath + "2d/fgui/CommUI");
            let blocker = fgui.UIPackage.createObject('CommUI', 'Blocker').asCom;
            if (blocker)
                InputBlocker.instance.init(blocker);
            let tip = fgui.UIPackage.createObject('CommUI', 'Tip').asCom;
            if (tip)
                TipUI.instance.init(tip);
            let popup = fgui.UIPackage.createObject('CommUI', 'Popup').asCom;
            if (popup)
                PopupUI.instance.init(popup);
            let dialog = fgui.UIPackage.createObject('CommUI', 'DialogPnl').asCom;
            if (dialog)
                DialogUI.instance.init(dialog);
            let setting = fgui.UIPackage.createObject('CommUI', 'SettingPnl').asCom;
            if (setting)
                SettingUI.instance.init(setting);
            let trans = fgui.UIPackage.createObject('CommUI', 'TransPnl').asCom;
            if (trans)
                TransUI.instance.init(trans);
            this._addProc(0, true);
            BaseUI.root.removeChild(this.loadPnl_);
            this.loadPnl_.dispose();
            fgui.UIPackage.removePackage("LoadUI");
            TransUI.instance.show(() => {
                Laya.Scene.open('HomeHUD.scene', true);
            });
        }
        _addProc(val, bFinished = false) {
            if (bFinished) {
                this.loadProc_ = 100;
            }
            else {
                this.loadProc_ += val;
                if (this.loadProc_ > 99) {
                    this.loadProc_ = 99;
                }
            }
            this.loadProg_.value = this.loadProc_;
        }
    }

    class GameConfig {
        constructor() { }
        static init() {
            var reg = Laya.ClassUtils.regClass;
            reg("game_ui/home_hud.ts", HomeHUD);
            reg("load.ts", Load);
        }
    }
    GameConfig.width = 720;
    GameConfig.height = 1280;
    GameConfig.scaleMode = "fixedwidth";
    GameConfig.screenMode = "vertical";
    GameConfig.alignV = "middle";
    GameConfig.alignH = "center";
    GameConfig.startScene = "Load.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = true;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    class Main {
        constructor() {
            if (window["Laya3D"])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            Laya["Physics"] && Laya["Physics"].enable();
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
                Laya.enableDebugPanel();
            if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
                Laya["PhysicsDebugDraw"].enable();
            Laya.alertGlobalError = true;
            Laya.MouseManager.multiTouchEnabled = false;
            Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
        }
        onVersionLoaded() {
            Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
        }
        onConfigLoaded() {
            GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
        }
    }
    new Main();

}());
//# sourceMappingURL=bundle.js.map
