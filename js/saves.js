function E(x){return new ExpantaNum(x)};
function ex(x){
    let nx = new E(0);
    nx.array = x.array;
    nx.sign = x.sign;
    nx.layer = x.layer;
    return nx;
}

function calc(dt) {
    if (player.mass.add(FUNCS.gainMass().mul(dt/1000).mul(FUNCS.getMassPower())).gte(FUNCS.getMaxMass()) && !MILESTONES.multiverse[3].can()) {
        player.mass = FUNCS.getMaxMass()
    } else player.mass = player.mass.add(FUNCS.gainMass().mul(dt/1000).mul(FUNCS.getMassPower()))
    for (let i = 0; i < Object.keys(FUNCS.unlockes).length; i++) if (FUNCS.unlockes[Object.keys(FUNCS.unlockes)[i]].can() && i <= player.unlocks) {
        FUNCS.getUnlock(Object.keys(FUNCS.unlockes)[i])
        if (player.unlocks < i+1) player.unlocks = i+1
    }
    for (let r = 1; r <= ACHIEVEMENTS.rows; r++) for (let c = 1; c <= ACHIEVEMENTS.cols; c++) if (ACHIEVEMENTS[r*10+c] != undefined) if (ACHIEVEMENTS[r*10+c].can()) FUNCS.unlockAch(r*10+c)
    if (player.unlocked.includes('automators')) player.gears = player.gears.add(FUNCS.getGears().mul(dt/1000))
    if (player.automators.mass_upgs && player.upgs.gears.includes(11)) for (let x = 1; x <= UPGS.mass.cols; x++) if (UPGS.mass[x].unl()) {
        if (player.upgs.gears.includes(21) && UPGS.mass[x].bulk != undefined) {
            UPGS.bulk('mass', x)
            continue
        }
        UPGS.buy('mass', x)
    }
    if (player.automators.rank && player.upgs.gears.includes(12)) FUNCS.rank.reset()
    if (player.automators.tier && player.upgs.gears.includes(13)) FUNCS.tier.reset()
    if (player.automators.tetr && player.upgs.gp.includes(12)) FUNCS.tetr.reset()
    if (MILESTONES.dark_matter[1].can()) player.black_hole.stored_mass = player.black_hole.stored_mass.add(FUNCS.gains.black_hole.storedGain().mul(dt/1000).mul(player.upgs.gp.includes(32)?FUNCS.getMassPower():1))
    if (MILESTONES.dark_matter[5].can()) player.rage_powers = player.rage_powers.add(FUNCS.gains.rage_powers.points().mul(dt/10000))
    if (MILESTONES.multiverse[2].can()) player.multiverse.gp = player.multiverse.gp.add(FUNCS.gains.gp().mul(dt/1000))
    if (player.upgs.gp.includes(34)) {
        let gain = FUNCS.gains.black_hole.points().mul(dt/10000)
        player.black_hole.dm = player.black_hole.dm.add(gain)
        player.black_hole.total_dm = player.black_hole.total_dm.add(gain)
    }
    if (MILESTONES.multiverse[6].can()) player.multiverse.pp = player.multiverse.pp.add(FUNCS.gains.pp().mul(dt/1000))
}

function wipe() {
    player = {
        mass: E(0),
        rank: E(1),
        tier: E(1),
        tetr: E(1),
        upgs: {
            mass: {},
            gears: [],
            rage_powers: [],
            dm: {},
            adm: [],
            gp: [],
            pp: {},
        },
        tabs: [0,0],
        msgs: {
            gpID: 0,
        },
        unlocked: [],
        achs: [],
        automators: {
            mass_upgs: false,
            rank: false,
            tier: false,
            tetr: false,
        },
        gears: E(0),
        rage_powers: E(0),
        unlocks: 0,
        black_hole: {
            dm: E(0),
            total_dm: E(0),
            stored_mass: E(0),
            bh_activated: false,
            adm: E(0),
        },
        multiverse: {
            number: E(1),
            gp: E(0),
            pp: E(0),
        },
    }
}

function save(){
    if (localStorage.getItem("incrementalMassSave") == '') wipe()
    localStorage.setItem("incrementalMassSave",btoa(JSON.stringify(player)))
}

function load(x){
    if(typeof x == "string" & x != ''){
        loadPlayer(JSON.parse(atob(x)))
    } else {
        wipe()
    }
}

function exporty() {
    save();
    let file = new Blob([btoa(JSON.stringify(player))], {type: "text/plain"})
    window.URL = window.URL || window.webkitURL;
    let a = document.createElement("a")
    a.href = window.URL.createObjectURL(file)
    a.download = "Incremental Mass Save.txt"
    a.click()
}

function importy() {
    let loadgame = prompt("Paste in your save WARNING: WILL OVERWRITE YOUR CURRENT SAVE")
    if (loadgame != null) {
        load(loadgame)
    }
}

function loadPlayer(load) {
    player.mass = ex(load.mass)
    player.rank = ex(load.rank)
    player.tier = ex(load.tier)
    if (load.tetr != undefined) player.tetr = ex(load.tetr)

    let p_upg = player.upgs, l_upg = load.upgs;
    for (let i = 0; i < Object.keys(l_upg.mass).length; i++) p_upg.mass[Object.keys(l_upg.mass)[i]] = ex(l_upg.mass[Object.keys(l_upg.mass)[i]])
    if (l_upg.gears != undefined) p_upg.gears = l_upg.gears
    if (l_upg.rage_powers != undefined) p_upg.rage_powers = l_upg.rage_powers
    if (l_upg.dm != undefined) for (let i = 0; i < Object.keys(l_upg.dm).length; i++) p_upg.dm[Object.keys(l_upg.dm)[i]] = ex(l_upg.dm[Object.keys(l_upg.dm)[i]])
    if (l_upg.adm != undefined) p_upg.adm = l_upg.adm
    if (l_upg.gp != undefined) p_upg.gp = l_upg.gp
    if (l_upg.pp != undefined) for (let i = 0; i < Object.keys(l_upg.pp).length; i++) p_upg.pp[Object.keys(l_upg.pp)[i]] = ex(l_upg.pp[Object.keys(l_upg.pp)[i]])

    if (load.automators != undefined) {
        let p_auto = player.automators, l_auto = load.automators;
        p_auto.mass_upgs = l_auto.mass_upgs
        p_auto.rank = l_auto.rank
        p_auto.tier = l_auto.tier
        if (l_auto.tetr != undefined) p_auto.tetr = l_auto.tetr
    }

    if (load.black_hole != undefined) {
        let p_bh = player.black_hole, l_bh = load.black_hole
        p_bh.dm = ex(l_bh.dm)
        p_bh.total_dm = ex(l_bh.total_dm)
        p_bh.stored_mass = ex(l_bh.stored_mass)
        p_bh.bh_activated = l_bh.bh_activated
        if (l_bh.adm != undefined) p_bh.adm = ex(l_bh.adm)
    }

    if (load.multiverse != undefined) {
        let pm = player.multiverse, lm = load.multiverse
        pm.number = ex(lm.number)
        if (lm.gp != undefined) pm.gp = ex(lm.gp)
        if (lm.pp != undefined) pm.pp = ex(lm.pp)
    }

    if (load.unlocked != undefined) player.unlocked = load.unlocked
    if (load.achs != undefined) player.achs = load.achs
    if (load.gears != undefined) player.gears = ex(load.gears)
    if (load.rage_powers != undefined) player.rage_powers = ex(load.rage_powers)
    if (load.unlocks != undefined) player.unlocks = load.unlocks
}

function loadGame() {
    wipe()
    load(localStorage.getItem("incrementalMassSave"))
    loadVue()
    setInterval(save,1000)
}