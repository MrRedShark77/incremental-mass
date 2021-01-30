var diff = 0;
var date = Date.now();
var player

const TABS = {
    1: [
        {id: 'Upgrades', unl() { return true }, style: 'normal_tab'},
        {id: 'Options', unl() { return true }, style: 'normal_tab'},
        {id: 'Achievements', unl() { return true }, style: 'normal_tab'},
        {id: 'Automators', unl() { return player.unlocked.includes('automators') }, style: 'normal_tab'},
        {id: 'Rage Powers', unl() { return player.unlocked.includes('rage_powers') }, style: 'rage_powers_tab'},
        {id: 'Black Hole', unl() { return player.unlocked.includes('black_hole') }, style: 'black_hole_tab'},
        {id: 'Multiverse', unl() { return player.unlocked.includes('multiverse') }, style: 'chroma_tab'},
    ],
    2: {
        'Black Hole': [
            {id: 'Dark Matters Milestone', unl() { return true }, style: 'normal_tab'},
            {id: 'Black Hole Extractor', unl() { return MILESTONES.dark_matter[1].can() }, style: 'normal_tab'},
            {id: 'Anti-Dark Matters', unl() { return player.unlocked.includes('antidark_matters') }, style: 'normal_tab'},
        ],
    },
}

const FUNCS = {
    config: {
        maxMilestones: 5,
    },
    gainMass() {
        let gain = E(1)
        if (FUNCS.hasBuyed('mass', 1)) gain = gain.add(UPGS.mass[1].effect())
        if (player.achs.includes(13)) gain = gain.mul(2)
        if (player.achs.includes(22)) gain = gain.mul(2)
        if (player.achs.includes(32)) gain = gain.mul(3)
        if (player.achs.includes(42)) gain = gain.mul(4)
        if (MILESTONES.rank[6].can()) gain = gain.mul(4)
        if (MILESTONES.rank[8].can()) gain = gain.mul(5)
        if (MILESTONES.rank[12].can()) gain = gain.mul(E(2).pow(player.rank.sub(39).max(0)))
        if (player.unlocked.includes('rage_powers')) gain = gain.mul(FUNCS.gains.rage_powers.effect().mul)
        if (MILESTONES.rank[4].can()) gain = gain.pow(1.25)
        if (player.black_hole.bh_activated) gain = gain.pow(1/3)
        return gain
    },
    getGears() {
        let gain = player.mass.add(1).log10().pow(3/4)
        if (player.achs.includes(14)) gain = gain.mul(3)
        if (player.achs.includes(51)) gain = gain.pow(2)
        return gain
    },
    getMaxMass() { return E(10).pow(player.rank.sub(1).sub(player.upgs.rage_powers.includes(13)?UPGS.rage_powers[13].effect():0).max(0).pow(1.5)
        .mul(MILESTONES.tier[1].can()?0.8:1)
        .add(1)) },
    rank: {
        can() { return player.mass.gte(FUNCS.getMaxMass()) },
        reset() {
            if (this.can()) {
                player.rank = player.rank.add(1)
                this.doReset('rank')
            }
        },
        doReset(msg) {
            if (!(msg == 'rank' && MILESTONES.dark_matter[2].can())) {
                player.mass = E(0)
                player.upgs.mass = {}
            }
        }
    },
    tier: {
        req() { return player.tier.add(1).pow(2) },
        can() { return player.rank.gte(this.req()) },
        reset() {
            if (this.can()) {
                player.tier = player.tier.add(1)
                this.doReset('tier')
            }
        },
        doReset(msg) {
            if (!(msg == 'tier' && MILESTONES.dark_matter[6].can())) {
                player.rank = E(1)
                FUNCS.rank.doReset()
            }
        }
    },
    hasUpgrade(type, id) {
        if (player.upgs[type][id] == undefined) return E(0)
        return player.upgs[type][id]
    },
    hasBuyed(type, id) {
        return player.upgs[type][id] != undefined
    },
    chTabs(i, x) {
        player.tabs[i] = x
        for (let j = i+1; j < player.tabs.length; j++) player.tabs[j] = 0
    },
    getUnlock(id) { if (!player.unlocked.includes(id)) player.unlocked.push(id) },
    unlockAch(id) { if (!player.achs.includes(id)) player.achs.push(id) },
    unlockes: {
        'automators': {
            req() { return E(1e15) },
            can() { return player.mass.gte(this.req()) },
            dis() { return formatMass(this.req()) },
            desc: `Automators`,
        },
        'rage_powers': {
            req() { return E(1.619e24) },
            can() { return player.mass.gte(this.req()) },
            dis() { return formatMass(this.req()) },
            desc: `Rage Powers`,
        },
        'black_hole': {
            req() { return E(1.5e111) },
            can() { return player.mass.gte(this.req()) },
            dis() { return formatMass(this.req()) },
            desc: `Black Hole`,
        },
        'antidark_matters': {
            req() { return E(1e15) },
            can() { return player.black_hole.stored_mass.gte(this.req()) },
            dis() { return formatMass(this.req())+' of stored mass in Black Hole' },
            desc: `Anti-Dark Matters`,
        },
        'multiverse': {
            req() { return E("2.685e364") },
            can() { return player.mass.gte(this.req()) },
            dis() { return formatMass(this.req()) },
            desc: `Multiverse`,
        },
    },
    getMassPower() {
        let gain = E(1)
        if (player.unlocked.includes('black_hole')) gain = gain.mul(FUNCS.gains.black_hole.effect().pow)
        return gain
    },
    gains: {
        rage_powers: {
            points(){
                let gain = player.mass.div(1.619e23).add(1).log10().pow(2)
                if (player.upgs.rage_powers.includes(11)) gain = gain.mul(UPGS.rage_powers[11].effect())
                if (player.upgs.rage_powers.includes(21)) gain = gain.mul(UPGS.rage_powers[21].effect())
                if (player.upgs.adm.includes(11)) gain = gain.mul(UPGS.adm[11].effect())
                if (player.achs.includes(33)) gain = gain.mul(2)
                if (player.achs.includes(44)) gain = gain.mul(2)
                if (player.unlocked.includes('black_hole')) gain = gain.mul(FUNCS.gains.black_hole.effect().mul)
                if (player.upgs.rage_powers.includes(23)) gain = gain.pow(1.25)
                if (player.black_hole.bh_activated) gain = gain.pow(1/3)
                return gain.floor()
            },
            effect(){
                let sc = E(3)
                if (player.upgs.adm.includes(12)) sc = sc.add(UPGS.adm[12].effect())

                let eff = {}

                eff.pow = player.rage_powers.add(1).log10().mul(2)
                if (eff.pow.gte(sc)) eff.pow = eff.pow.sub(sc).pow(3/4).add(sc)
                if (player.upgs.rage_powers.includes(12)) eff.pow = eff.pow.mul(1.15)
                if (player.upgs.rage_powers.includes(22)) eff.pow = eff.pow.mul(UPGS.rage_powers[22].effect())
                if (player.black_hole.bh_activated) eff.pow = eff.pow.div(3)

                eff.mul = player.mass.add(1).log10().add(1).pow(eff.pow)

                return eff
            },
            canReset(){ return this.points().gte(1) },
            reset(){
                if (this.canReset()) {
                    player.rage_powers = player.rage_powers.add(this.points())
                    this.doReset()
                }
            },
            doReset(msg){
                player.tier = E(1)
                FUNCS.tier.doReset()
            },
        },
        black_hole: {
            points(){
                let gain = player.rage_powers.pow(1/5).sub(10).max(0)
                if (player.unlocked.includes('antidark_matters')) gain = gain.mul(FUNCS.gains.antidark_matters.effect().mul)
                return gain.floor()
            },
            canReset(){ return this.points().gte(1) },
            reset(){
                if (this.canReset()) {
                    let gain = this.points()
                    player.black_hole.dm = player.black_hole.dm.add(gain)
                    player.black_hole.total_dm = player.black_hole.total_dm.add(gain)
                    this.doReset('bh')
                }
            },
            doReset(msg){
                player.rage_powers = E(0)
                if (!(msg == 'bh' && MILESTONES.dark_matter[4].can())) player.upgs.rage_powers = []
                player.gears = E(0)
                FUNCS.gains.rage_powers.doReset()
            },
            effect(){
                let eff = {}

                eff.mul = player.black_hole.dm.add(1).pow(player.achs.includes(25)?3/5:1/2)

                eff.pow = player.black_hole.stored_mass.add(1).log10().add(1).pow(0.75)
                if (FUNCS.hasBuyed('dm', 2)) eff.pow = eff.pow.mul(UPGS.dm[2].effect())

                return eff
            },
            execute(){
                this.doReset('bh')
                player.black_hole.bh_activated = !player.black_hole.bh_activated
            },
            storedGain(){
                let gain = player.mass
                if (player.achs.includes(43)) gain = gain.mul(2)
                if (player.achs.includes(53)) gain = gain.mul(3)
                if (FUNCS.hasBuyed('dm', 1)) gain = gain.mul(UPGS.dm[1].effect())

                if (!player.black_hole.bh_activated) gain = E(0)
                return gain
            },
        },
        antidark_matters: {
            points(){
                let gain = player.black_hole.dm.pow(3/5)
                return gain.floor()
            },
            canReset(){ return this.points().gte(1) },
            reset(){
                if (this.canReset()) {
                    let gain = this.points()
                    player.black_hole.adm = player.black_hole.adm.add(gain)
                    this.doReset('adm')
                }
            },
            doReset(msg){
                player.black_hole.dm = E(0)
                FUNCS.gains.black_hole.doReset()
            },
            effect(){
                let eff = {}

                eff.mul = player.black_hole.adm.add(1).pow(2/7)

                return eff
            },
        },
    },
    msgs: {
        execute() { return player.black_hole.bh_activated?'Stop Execute Black Hole':'Start to Execute Black Hole' },
    },
}

const UPGS = {
    mass: {
        name: 'mass',
        type: 'buyables',
        res: 'mass',

        cols: 4,
        1: {
            unl() { return MILESTONES.rank[1].can() },
            desc() { return 'Adds '+
                formatMass(
                    E(FUNCS.hasBuyed('mass', 2)?UPGS.mass[2].effect():1)
                    .mul(MILESTONES.rank[3].can()?FUNCS.hasUpgrade('mass', 1).div(5).add(1):1)
                    .pow(MILESTONES.rank[7].can()?1.1:1)
                )
            +' gained mass.' },
            cost(x=FUNCS.hasUpgrade('mass', 1)) { return E(E(.5).mul(MILESTONES.rank[2].can()?0.85:1).sub(MILESTONES.tier[3].can()?0.2:0).add(1)).pow(x).mul(10).div(FUNCS.hasBuyed('mass', 4)?UPGS.mass[4].effect():1) },
            can() { return player.mass.gte(this.cost()) },
            effect() {
                let eff = E(1)
                if (FUNCS.hasBuyed('mass', 2)) eff = eff.mul(UPGS.mass[2].effect())
                if (MILESTONES.rank[3].can()) eff = eff.mul(FUNCS.hasUpgrade('mass', 1).div(5).add(1))
                if (MILESTONES.rank[7].can()) eff = eff.pow(1.1)

                let lvl = FUNCS.hasUpgrade('mass', 1)
                if (MILESTONES.dark_matter[3].can()) lvl = lvl.add(player.black_hole.total_dm.mul(5))
                return eff.mul(lvl)
            },
            effDesc(x=this.effect()) { return '+'+formatMass(x) },
            bulk(){
                return player.mass.mul(FUNCS.hasBuyed('mass', 4)?UPGS.mass[4].effect():1).div(10).add(1).logBase(E(.5).mul(MILESTONES.rank[2].can()?0.85:1).sub(MILESTONES.tier[3].can()?0.2:0).add(1)).floor()
            },
        },
        2: {
            unl() { return MILESTONES.rank[2].can() },
            desc() { return 'Multiples mass upgrade 1 effect by '+format(
                    E(1.5).pow(FUNCS.hasBuyed('mass', 3)?UPGS.mass[3].effect():1)
                    .mul(MILESTONES.rank[5].can()?player.rank.add(1).pow(MILESTONES.rank[9].can()?9/20:2/5):1)
                    .mul(MILESTONES.tier[2].can()?FUNCS.hasUpgrade('mass', 2).div(5).add(1):1)
                    , 2)+' (additive)' },
            cost(x=FUNCS.hasUpgrade('mass', 2)) { return E(5).mul(E(MILESTONES.rank[3].can()?0.9:1).sub(MILESTONES.tier[3].can()?0.2:0)).pow(x).mul(100).div(FUNCS.hasBuyed('mass', 4)?UPGS.mass[4].effect():1) },
            can() { return player.mass.gte(this.cost()) },
            effect() {
                let lvl = FUNCS.hasUpgrade('mass', 2)
                if (MILESTONES.dark_matter[3].can()) lvl = lvl.add(player.black_hole.total_dm.mul(5))
                let eff = lvl.mul(E(1.5).pow(FUNCS.hasBuyed('mass', 3)?UPGS.mass[3].effect():1)
                .mul(MILESTONES.rank[5].can()?player.rank.add(1).pow(MILESTONES.rank[9].can()?9/20:2/5):1)
                .mul(MILESTONES.tier[2].can()?FUNCS.hasUpgrade('mass', 2).div(5).add(1):1)).add(1)
                .pow(MILESTONES.rank[11].can()?1.025:1)
                return eff
            },
            effDesc(x=this.effect()) { return 'x'+format(x,1) },
            bulk(){
                return player.mass.mul(FUNCS.hasBuyed('mass', 4)?UPGS.mass[4].effect():1).div(100).add(1).logBase(E(5).mul(E(MILESTONES.rank[3].can()?0.9:1).sub(MILESTONES.tier[3].can()?0.2:0))).floor()
            },
        },
        3: {
            unl() { return MILESTONES.rank[3].can() },
            desc() { return 'Raises mass upgrade 2 effect by '+format(E(MILESTONES.rank[5].can()?player.rank.add(1).pow(MILESTONES.rank[9].can()?9/20:2/5):1), 2)+' (additive)' },
            cost(x=FUNCS.hasUpgrade('mass', 3)) { return E(10).mul(E(MILESTONES.rank[7].can()?0.75:1).sub(MILESTONES.tier[3].can()?0.2:0)).pow(x).mul(1000).div(FUNCS.hasBuyed('mass', 4)?UPGS.mass[4].effect():1) },
            can() { return player.mass.gte(this.cost()) },
            effect() {
                let lvl = FUNCS.hasUpgrade('mass', 3)
                if (lvl.gte(10)) lvl = lvl.sub(10).pow(MILESTONES.rank[10].can()?0.775:3/4).add(10)
                return lvl.add(1).add(MILESTONES.tier[4].can()?player.rank.pow(0.525):0).mul(MILESTONES.rank[5].can()?player.rank.add(1).pow(MILESTONES.rank[9].can()?9/20:2/5):1)
            },
            effDesc(x=this.effect()) { return '^'+format(x,2) },
            bulk(){
                return player.mass.mul(FUNCS.hasBuyed('mass', 4)?UPGS.mass[4].effect():1).div(1000).add(1).logBase(E(10).mul(E(MILESTONES.rank[7].can()?0.75:1).sub(MILESTONES.tier[3].can()?0.2:0))).floor()
            },
        },
        4: {
            unl() { return MILESTONES.tier[5].can() },
            desc() { return 'Divides all previous mass upgrades cost.' },
            cost(x=FUNCS.hasUpgrade('mass', 4)) { return E(1e3).pow(x).mul(1e3) },
            can() { return player.mass.gte(this.cost()) },
            effect() {
                let lvl = FUNCS.hasUpgrade('mass', 4)
                return E(1.75).pow(lvl)
            },
            effDesc(x=this.effect()) { return '/'+format(x,0) },
            bulk(){
                return player.mass.div(1e3).add(1).logBase(1e3).floor()
            },
        },
    },
    gears: {
        name: 'gears',
        type: 'normal',
        res: 'gears',

        cols: 3,
        rows: 2,
        11: {
            unl() { return player.unlocked.includes('automators') },
            desc() { return 'Auto-Buy Mass Upgrades' },
            cost() { return E(200) },
            can() { return player.gears.gte(this.cost()) },
        },
        12: {
            unl() { return player.unlocked.includes('automators') },
            desc() { return 'Auto-Rank' },
            cost() { return E(1000) },
            can() { return player.gears.gte(this.cost()) },
        },
        13: {
            unl() { return player.unlocked.includes('automators') },
            desc() { return 'Auto-Tier' },
            cost() { return E(10000) },
            can() { return player.gears.gte(this.cost()) },
        },
        21: {
            unl() { return player.upgs.gears.includes(11) },
            desc() { return 'Bulk Mass Upgrades' },
            cost() { return E(3200) },
            can() { return player.gears.gte(this.cost()) },
        },
        22: {
            unl() { return false },
            desc() { return 'Placeholder' },
            cost() { return E(1/0) },
            can() { return player.gears.gte(this.cost()) },
        },
        23: {
            unl() { return false },
            desc() { return 'Placeholder' },
            cost() { return E(1/0) },
            can() { return player.gears.gte(this.cost()) },
        },
    },
    rage_powers: {
        name: 'rage_powers',
        type: 'normal',
        res: 'rage_powers',

        cols: 3,
        rows: 2,
        11: {
            unl() { return player.unlocked.includes('rage_powers') && player.achs.includes(24) },
            desc() { return 'Gain more RP based on unspent gears.' },
            cost() { return E(1500) },
            can() { return player.rage_powers.gte(this.cost()) },
            effect() {
                let eff = player.gears.add(1).log10().add(1).pow(1/2)
                return eff
            },
            effDesc(x=this.effect()) { return format(x,2)+'x' },
        },
        12: {
            unl() { return player.unlocked.includes('rage_powers') && player.achs.includes(24) },
            desc() { return 'Rage Powers are 15% stronger.' },
            cost() { return E(15000) },
            can() { return player.rage_powers.gte(this.cost()) },
        },
        13: {
            unl() { return player.unlocked.includes('rage_powers') && player.achs.includes(24) },
            desc() { return 'Subtract rank requirement based on unspent RP.' },
            cost() { return E(60000) },
            can() { return player.rage_powers.gte(this.cost()) },
            effect() {
                let eff = player.rage_powers.add(1).log10().div(6.5).add(.1)
                return eff
            },
            effDesc(x=this.effect()) { return '-'+format(x) },
        },
        21: {
            unl() { return player.unlocked.includes('rage_powers') && MILESTONES.dark_matter[4].can() },
            desc() { return 'Gain RP based on unspent RP.' },
            cost() { return E(3e6) },
            can() { return player.rage_powers.gte(this.cost()) },
            effect() {
                let eff = player.rage_powers.add(1).log10().add(1).pow(3/5)
                return eff
            },
            effDesc(x=this.effect()) { return format(x,2)+'x' },
        },
        22: {
            unl() { return player.unlocked.includes('rage_powers') && MILESTONES.dark_matter[4].can() },
            desc() { return 'Rage Powers are stronger based on stored mass in Black Hole.' },
            cost() { return E(1e8) },
            can() { return player.rage_powers.gte(this.cost()) },
            effect() {
                let eff = player.black_hole.stored_mass.add(1).log10().mul(1.1).div(100).add(1)
                return eff
            },
            effDesc(x=this.effect()) { return format(x.sub(1).mul(100))+'%' },
        },
        23: {
            unl() { return player.unlocked.includes('rage_powers') && MILESTONES.dark_matter[4].can() },
            desc() { return 'Raise RP gain by 1.25.' },
            cost() { return E(1.5e9) },
            can() { return player.rage_powers.gte(this.cost()) },
        },
    },
    dm: {
        name: 'dm',
        parent: 'black_hole',
        type: 'buyables',
        res: 'dm',

        cols: 3,
        1: {
            unl() { return MILESTONES.dark_matter[1].can() },
            desc() { return 'Multiples stored mass in Black Hole gain.' },
            cost(x=FUNCS.hasUpgrade('dm', 1)) { return FUNCS.hasUpgrade('dm', 1).add(1).floor() },
            can() { return player.black_hole.dm.gte(this.cost()) },
            effect() {
                let lvl = FUNCS.hasUpgrade('dm', 1)
                if (lvl.gte(20)) lvl = lvl.sub(20).pow(1/2).add(20)
                if (lvl.gte(20)) lvl = lvl.sub(20).pow(1/2).add(20)
                return E(1.2).pow(lvl).pow(FUNCS.hasBuyed('dm', 3)?UPGS.dm[3].effect():1)
            },
            effDesc(x=this.effect()) { return 'x'+format(x, 2) },
        },
        2: {
            unl() { return MILESTONES.dark_matter[1].can() },
            desc() { return 'Multiples stored mass in Black Hole effect.' },
            cost(x=FUNCS.hasUpgrade('dm', 2)) { return FUNCS.hasUpgrade('dm', 2).add(1).floor() },
            can() { return player.black_hole.dm.gte(this.cost()) },
            effect() {
                let lvl = FUNCS.hasUpgrade('dm', 2)
                return E(1/4).mul(lvl).add(1).pow(FUNCS.hasBuyed('dm', 3)?UPGS.dm[3].effect():1)
            },
            effDesc(x=this.effect()) { return 'x'+format(x, 2) },
        },
        3: {
            unl() { return MILESTONES.dark_matter[5].can() },
            desc() { return 'Raises all these prevoius upgrades effects.' },
            cost(x=FUNCS.hasUpgrade('dm', 3)) { return FUNCS.hasUpgrade('dm', 3).add(1).pow(1.5).mul(2).floor() },
            can() { return player.black_hole.dm.gte(this.cost()) },
            effect() {
                let lvl = FUNCS.hasUpgrade('dm', 3)
                return lvl.add(1).pow(2/5)
            },
            effDesc(x=this.effect()) { return '^'+format(x, 2) },
        },
    },
    adm: {
        name: 'adm',
        parent: 'black_hole',
        type: 'normal',
        res: 'adm',

        cols: 2,
        rows: 1,
        11: {
            unl() { return player.unlocked.includes('antidark_matters') },
            desc() { return 'Gain more RP based on unspent Anti-Dark Matters.' },
            cost() { return E(100) },
            can() { return player.black_hole.adm.gte(this.cost()) },
            effect() {
                let eff = player.black_hole.adm.add(1).pow(9/20)
                return eff
            },
            effDesc(x=this.effect()) { return format(x,2)+'x' },
        },
        12: {
            unl() { return player.unlocked.includes('antidark_matters') },
            desc() { return 'Adds softcap of RP effect.' },
            cost() { return E(500) },
            can() { return player.black_hole.adm.gte(this.cost()) },
            effect() {
                let eff = player.black_hole.adm.pow(1/3)
                return eff
            },
            effDesc(x=this.effect()) { return "+"+format(x,2) },
        },
    },
    buy(name, id) {
        let cost = UPGS[name][id].cost()
        let can = false
        if (UPGS[name].parent != undefined) can = player[UPGS[name].parent][UPGS[name].res].gte(cost) && (UPGS[name].type == 'normal'?!player.upgs[name].includes(id):true)
        else can = player[UPGS[name].res].gte(cost) && (UPGS[name].type == 'normal'?!player.upgs[name].includes(id):true)
        if (can) {
            if (UPGS[name].parent != undefined) player[UPGS[name].parent][UPGS[name].res] = player[UPGS[name].parent][UPGS[name].res].sub(cost)
            else player[UPGS[name].res] = player[UPGS[name].res].sub(cost)
            switch(UPGS[name].type) {
                case 'normal':
                    player.upgs[name].push(id)
                    break
                case 'buyables':
                    if (player.upgs[name][id] == undefined) player.upgs[name][id] = E(0)
                    player.upgs[name][id] = player.upgs[name][id].add(1)
                    break
            }
        }
    },
    bulk(name, id) {
        let bulk = UPGS[name][id].bulk()
        let cost = UPGS[name][id].cost(bulk)
        if (player[UPGS[name].res].gte(cost) && bulk.add(1).gt(FUNCS.hasUpgrade(name, id))) {
            player[UPGS[name].res] = player[UPGS[name].res].sub(cost)
            if (player.upgs[name][id] == undefined) player.upgs[name][id] = E(0)
            player.upgs[name][id] = bulk.add(1)
        }
    },
}

const MILESTONES = {
    rank: {
        rows: 12,
        1: {
            desc() { return 'Unlock new upgrade.' },
            req() { return E(2) },
            can() { return player.rank.gte(this.req()) },
        },
        2: {
            desc() { return 'Unlock second upgrade. Reduce mass upgrade 1 cost scaled by 15%.' },
            req() { return E(3) },
            can() { return player.rank.gte(this.req()) },
        },
        3: {
            desc() { return 'Unlock third upgrade. Reduce mass upgrade 2 cost scaled by 15%. Mass upgrade 1 level boost this effect.' },
            req() { return E(4) },
            can() { return player.rank.gte(this.req()) },
        },
        4: {
            desc() { return 'Raise mass gain by 1.25.' },
            req() { return E(5) },
            can() { return player.rank.gte(this.req()) },
        },
        5: {
            desc() { return 'Multiples mass upgrades 2-3 effects based on ranks.' },
            req() { return E(6) },
            can() { return player.rank.gte(this.req()) },
        },
        6: {
            desc() { return 'Quadruples mass gain.' },
            req() { return E(8) },
            can() { return player.rank.gte(this.req()) },
        },
        7: {
            desc() { return 'Reduce mass upgrade 3 cost scaled by 25%. Raise mass upgrade 1 effect by 1.1.' },
            req() { return E(10) },
            can() { return player.rank.gte(this.req()) },
        },
        8: {
            desc() { return 'Quintuples mass gain.' },
            req() { return E(17) },
            can() { return player.rank.gte(this.req()) },
        },
        9: {
            desc() { return 'Rank 6 effect is stronger.' },
            req() { return E(20) },
            can() { return player.rank.gte(this.req()) },
        },
        10: {
            desc() { return 'Mass upgrade 3 softcapped is weaker.' },
            req() { return E(24) },
            can() { return player.rank.gte(this.req()) },
        },
        11: {
            desc() { return 'Mass upgrade 2 is even stronger.' },
            req() { return E(30) },
            can() { return player.rank.gte(this.req()) },
        },
        12: {
            desc() { return 'For every rank (start at 40) multiples mass gain by 2.' },
            req() { return E(40) },
            can() { return player.rank.gte(this.req()) },
        },
    },
    tier: {
        rows: 5,
        1: {
            desc() { return 'Reduce rank reqirements by 20%.' },
            req() { return E(2) },
            can() { return player.tier.gte(this.req()) },
        },
        2: {
            desc() { return 'Mass upgrade 2 level boost this effect.' },
            req() { return E(3) },
            can() { return player.tier.gte(this.req()) },
        },
        3: {
            desc() { return 'Reduce mass upgrade 1-3 cost scaled by 20%.' },
            req() { return E(4) },
            can() { return player.tier.gte(this.req()) },
        },
        4: {
            desc() { return 'Gain free mass upgrade 3 levels based on ranks.' },
            req() { return E(5) },
            can() { return player.tier.gte(this.req()) },
        },
        5: {
            desc() { return 'Unlock fourth mass upgrade, called "cheaper".' },
            req() { return E(7) },
            can() { return player.tier.gte(this.req()) },
        },
    },
    dark_matter: {
        rows: 6,
        1: {
            desc() { return 'Unlock Black Hole Extractor.' },
            req() { return E(1) },
            can() { return player.black_hole.total_dm.gte(this.req()) },
        },
        2: {
            desc() { return 'Rank doesn’t reset mass and upgrades.' },
            req() { return E(5) },
            can() { return player.black_hole.total_dm.gte(this.req()) },
        },
        3: {
            desc() { return `Gain free mass upgrade 1-2 based on total Dark Matters.` },
            req() { return E(15) },
            can() { return player.black_hole.total_dm.gte(this.req()) },
        },
        4: {
            desc() { return `Unlocks new Rage Powers upgrades. Keep RP upgrades on reset.` },
            req() { return E(40) },
            can() { return player.black_hole.total_dm.gte(this.req()) },
        },
        5: {
            desc() { return `Gain 10% of RP gain per second. Unlock third stored mass upgrade.` },
            req() { return E(160) },
            can() { return player.black_hole.total_dm.gte(this.req()) },
        },
        6: {
            desc() { return `Tier no longer resets rank.` },
            req() { return E(640) },
            can() { return player.black_hole.total_dm.gte(this.req()) },
        },
    },
}

const ACHIEVEMENTS = {
    cols: 5,
    rows: 5,
    11: {
        title: 'First time',
        desc() { return `Push ${formatMass('100')}.` },
        can() { return player.mass.gte(100) },
    },
    12: {
        title: 'New Rank',
        desc() { return `Reach Rank 5.` },
        can() { return player.rank.gte(5) },
    },
    13: {
        title: 'Higher Rank',
        desc() { return `Reach Tier 2. Reward: Double mass gain.` },
        can() { return player.tier.gte(2) },
    },
    14: {
        title: 'Upgrade Power',
        desc() { return `Get Rage Powers. Reward: Triple gears gain.` },
        can() { return player.rage_powers.gte(1) },
    },
    15: {
        title: 'MASSPOW!',
        desc() { return `Get x${format(1000)} mass power.` },
        can() { return FUNCS.getMassPower().gte(1000) },
    },
    21: {
        title: 'Heavy go brr',
        desc() { return `Push ${formatMass('1e6')}.` },
        can() { return player.mass.gte(1e6) },
    },
    22: {
        title: 'Ranker',
        desc() { return `Reach Rank 10. Reward: Double mass gain.` },
        can() { return player.rank.gte(10) },
    },
    23: {
        title: 'T.he T.hird T.ier',
        desc() { return `Reach Tier 3.` },
        can() { return player.tier.gte(3) },
    },
    24: {
        title: 'RAGEPUSHER',
        desc() { return `Gain ${format(1000)} Rage Powers. Reward: Unlock new Rage Power upgrades.` },
        can() { return player.rage_powers.gte(1000) },
    },
    25: {
        title: 'Antimatter?',
        desc() { return `Get Anti-Dark Matters. Reward: Dark Matters effect are stronger.` },
        can() { return player.black_hole.adm.gte(1) },
    },
    31: {
        title: 'Highest mountain',
        desc() { return `Push ${formatMass('1.619e20')}.` },
        can() { return player.mass.gte(1.619e20) },
    },
    32: {
        title: 'Rankerer',
        desc() { return `Reach Rank 15. Reward: Triple mass gain.` },
        can() { return player.rank.gte(15) },
    },
    33: {
        title: 'Tierer',
        desc() { return `Reach Tier 5. Reward: Double RP gain.` },
        can() { return player.tier.gte(5) },
    },
    34: {
        title: 'BLACK HOLE',
        desc() { return `Transform Rage Powers.` },
        can() { return player.black_hole.total_dm.gte(1) },
    },
    41: {
        title: 'UY Scuti',
        desc() { return `Push ${formatMass('1.989e34')}.` },
        can() { return player.mass.gte(1.989e34) },
    },
    42: {
        title: 'Rankest',
        desc() { return `Reach Rank 20. Reward: Quadruple mass gain.` },
        can() { return player.rank.gte(20) },
    },
    43: {
        title: 'Black Storage',
        desc() { return `Get ${formatMass(1e6)} of stored mass in Black Hole. Reward: Double stored mass gain.` },
        can() { return player.black_hole.stored_mass.gte(1e6) },
    },
    44: {
        title: 'Twenty Black Holes',
        desc() { return `Gain 20 total Dark Matters. Reward: Double RP gain.` },
        can() { return player.black_hole.total_dm.gte(20) },
    },
    51: {
        title: 'Lets go, Universe!',
        desc() { return `Push ${formatMass('1.5e56')}. Reward: Square gear production.` },
        can() { return player.mass.gte(1.5e56) },
    },
    52: {
        title: 'Googol Universes!',
        desc() { return `Push ${formatMass('1.5e156')}.` },
        can() { return player.mass.gte(1.5e156) },
    },
    53: {
        title: 'Black Hole loves eat our Earth',
        desc() { return `Get ${formatMass(5.972e27)} of stored mass in Black Hole. Reward: Triple stored mass gain.` },
        can() { return player.black_hole.stored_mass.gte(5.972e27) },
    },
}

function loop() {
    diff = Date.now()-date;
    calc(diff);
    date = Date.now();
}

function format(ex, acc=3) {
    ex = E(ex)
    if (ex.isInfinite()) return '∞'
    neg = ex.isNegative()
    let e = ex.log10().floor()
    if (e.lt(9)) {
        if (e.lt(3)) {
            return (neg?'-':'') + ex.toFixed(acc)
        }
        return (neg?'-':'') + ex.floor().toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    } else {
        if (ex.gte("eeee9")) {
            let slog = ex.slog()
            return (neg?'-':'') + (slog.gte(1e9)?'':E(10).pow(slog.sub(slog.floor())).toFixed(3)) + "F" + format(slog.floor(), 0)
        }
        let m = ex.div(E(10).pow(e))
        return (neg?'-':'') + (e.log10().gte(9)?'':m.toFixed(3))+'e'+format(e,0)
    }
}

function formatMass(ex) {
    ex = E(ex)
    if (ex.isInfinite()) return '∞ uni'
    if (ex.gte(1.5e56)) return format(ex.div(1.5e56), 1) + ' uni'
    if (ex.gte(2.9835e45)) return format(ex.div(2.9835e45), 1) + ' MMWG'
    if (ex.gte(1.989e33)) return format(ex.div(1.989e33), 1) + ' M☉'
    if (ex.gte(5.972e27)) return format(ex.div(5.972e27), 1) + ' M⊕'
    if (ex.gte(1.619e20)) return format(ex.div(1.619e20), 1) + ' MME'
    if (ex.gte(1e6)) return format(ex.div(1e6), 1) + ' tonne'
    if (ex.gte(1e3)) return format(ex.div(1e3), 1) + ' kg'
    return format(ex, 1) + ' g'
}

setInterval(loop, 50)