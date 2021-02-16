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
        'Upgrades': [
            {id: 'Mass', unl() { return true }, style: 'normal_tab'},
            {id: 'Ex-Mass', unl() { return MILESTONES.multiverse[8].can() }, style: 'normal_tab'},
        ],
        'Black Hole': [
            {id: 'Dark Matters Milestone', unl() { return true }, style: 'normal_tab'},
            {id: 'Black Hole Extractor', unl() { return MILESTONES.dark_matter[1].can() }, style: 'normal_tab'},
            {id: 'Anti-Dark Matters', unl() { return player.unlocked.includes('antidark_matters') }, style: 'normal_tab'},
        ],
        'Multiverse': [
            {id: 'Multiverse Milestone', unl() { return true }, style: 'normal_tab'},
            {id: 'Grid Upgrades', unl() { return MILESTONES.multiverse[2].can() }, style: 'normal_tab'},
            {id: 'Pentogen', unl() { return MILESTONES.multiverse[6].can() }, style: 'pentogen_tab'},
            {id: 'ChallenGreek', unl() { return player.unlocked.includes('challengreek') }, style: 'normal_tab'},
        ],
    },
}

const FUNCS = {
    config: {
        maxMilestones: 6,
        smallLayerName: ['rank', 'tier', 'tetr', 'pent'],
        LayerName: ['Rank', 'Tier', 'Tetr', 'Pent'],
    },
    gainMass() {
        let softcap = E(100)
        if (MILESTONES.tetr[5].can()) softcap = softcap.add(100)
        if (MILESTONES.tier[7].can()) softcap = softcap.add(player.tier.sub(79).pow(3).mul(10))
        if (player.upgs.adm.includes(13)) softcap = softcap.add(UPGS.adm[13].effect())
        if (player.upgs.gp.includes(41)) softcap = softcap.add(UPGS.gp[41].effect())

        let gain = E(1)
        if (FUNCS.hasBuyed('mass', 1)) gain = gain.add(UPGS.mass[1].effect())
        if (player.achs.includes(13)) gain = gain.mul(2)
        if (player.achs.includes(22)) gain = gain.mul(2)
        if (player.achs.includes(32)) gain = gain.mul(3)
        if (player.achs.includes(42)) gain = gain.mul(4)
        if (MILESTONES.rank[6].can()) gain = gain.mul(4)
        if (MILESTONES.rank[8].can()) gain = gain.mul(5)
        if (MILESTONES.rank[12].can()) gain = gain.mul(MILESTONES.rank[12].effect().pow(player.rank.sub(39).max(0).pow(player.rank.gte(softcap)?(0.969):1)))
        if (player.unlocked.includes('rage_powers')) gain = gain.mul(FUNCS.gains.rage_powers.effect().mul)
        if (FUNCS.hasBuyed('pp', 1) && CHALGREEK.ch() == 0) gain = gain.mul(UPGS.pp[1].effect())
        if (CHALGREEK[1].unl()) gain = gain.mul(CHALGREEK[1].effect())
        if (MILESTONES.rank[4].can()) gain = gain.pow(1.25)
        if (MILESTONES.tetr[8].can()) gain = gain.pow(1.1)
        if (player.black_hole.bh_activated) gain = gain.pow(1/3)
        if (FUNCS.penaltyMass().gt(1)) gain = gain.div(FUNCS.penaltyMass())
        return gain
    },
    penaltyMass() {
        let max = FUNCS.multiverse.caps()
        if (player.mass.lt(max)) return E(1)

        let log = player.mass.div(max).add(1).log10()
        let pen = E(E(2).add(log.div(10))).pow(log.pow(1.1))
        return pen
    },
    getGears() {
        let gain = player.mass.add(1).log10().pow(3/4)
        if (player.upgs.gp.includes(21)) gain = player.mass.add(1).logBase(5).pow(3)
        if (player.achs.includes(14)) gain = gain.mul(3)
        if (player.achs.includes(51)) gain = gain.pow(2)
        return gain
    },
    getMaxMass() { return E(10).pow(player.rank.sub(1).sub(CHALGREEK[4].unl()?CHALGREEK[4].effect():0).sub(player.upgs.rage_powers.includes(13)?UPGS.rage_powers[13].effect():0).max(0).pow((CHALGREEK.ch() == 1)?2:1.5)
        .mul(MILESTONES.tier[1].can()?0.8:1)
        .add(1)) },
    rank: {
        unl() { return true },
        can() { return player.mass.gte(FUNCS.getMaxMass()) },
        reset() {
            if (this.can()) {
                if (MILESTONES.multiverse[3].can()) { if (this.bulk().add(1).gt(player.rank)) player.rank = this.bulk().add(1) }
                else player.rank = player.rank.add(1)
                this.doReset('rank')
            }
        },
        doReset(msg) {
            if (!(msg == 'rank' && MILESTONES.dark_matter[2].can())) {
                player.mass = E(0)
                player.upgs.mass = {}
            }
        },
        bulk() { return player.mass.add(1).log10().sub(1).div(MILESTONES.tier[1].can()?0.8:1).max(0).pow(1/((CHALGREEK.ch() == 1 || CHALGREEK.ch() == 5)?2:1.5)).add(player.upgs.rage_powers.includes(13)?UPGS.rage_powers[13].effect():0).add(CHALGREEK[4].unl()?CHALGREEK[4].effect():0).add(1).floor() }
    },
    tier: {
        unl() { return !(CHALGREEK.ch() == 4 || CHALGREEK.ch() == 5) },
        req() {
            let exp = E(2)
            if (MILESTONES.tetr[1].can()) exp = exp.mul(0.9)
            return player.tier.sub(UPGS.ex_mass[3].unl()?UPGS.ex_mass[3].effect():0).add(1).max(0).pow(exp).floor()
        },
        can() { return player.rank.gte(this.req()) },
        reset() {
            if (this.can()) {
                if (MILESTONES.multiverse[7].can()) { if (this.bulk().add(1).gt(player.tier)) player.tier = this.bulk().add(1) }
                else player.tier = player.tier.add(1)
                this.doReset('tier')
            }
        },
        doReset(msg) {
            if (!(msg == 'tier' && MILESTONES.dark_matter[6].can())) {
                player.rank = E(1)
                FUNCS.rank.doReset()
            }
        },
        bulk() {
            let exp = E(2)
            if (MILESTONES.tetr[1].can()) exp = exp.mul(0.9)
            return player.rank.pow(E(1).div(exp)).sub(1).add(UPGS.ex_mass[3].unl()?UPGS.ex_mass[3].effect():0).floor()
        },
    },
    tetr: {
        unl() { return MILESTONES.multiverse[1].can() && !(CHALGREEK.ch() == 4 || CHALGREEK.ch() == 5) },
        req() {
            let exp = E(2)
            if (MILESTONES.pent[1].can()) exp = exp.mul(0.95)
            let num = player.tetr.add(1)
            return num.pow(exp).div(2).add(1).floor()
        },
        can() { return player.tier.gte(this.req()) },
        reset() {
            if (this.can()) {
                if (MILESTONES.multiverse[9].can()) { if (this.bulk().add(1).gt(player.tetr)) player.tetr = this.bulk().add(1) }
                else player.tetr = player.tetr.add(1)
                this.doReset('tetr')
            }
        },
        doReset(msg) {
            if (!(msg == 'tetr' && player.upgs.gp.includes(24))) {
                player.tier = E(1)
                FUNCS.tier.doReset()
            }
        },
        bulk() {
            let exp = E(2)
            if (MILESTONES.pent[1].can()) exp = exp.mul(0.95)
            return player.tier.sub(1).mul(2).max(0).pow(E(1).div(exp)).floor()
        },
    },
    pent: {
        unl() { return player.upgs.gp.includes(54) && !(CHALGREEK.ch() == 4 || CHALGREEK.ch() == 5) },
        req() {
            let num = player.pent.add(1)
            return num.pow(3)
        },
        can() { return player.tetr.gte(this.req()) },
        reset() {
            if (this.can()) {
                player.pent = player.pent.add(1)
                this.doReset('pent')
            }
        },
        doReset(msg) {
            player.tetr = E(1)
            FUNCS.tetr.doReset()
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
        'challengreek': {
            req() { return E(42) },
            can() { return player.multiverse.number.gte(this.req()) },
            dis() { return 'Multiverse #'+format(this.req()) },
            desc: `ChallenGreek`,
        },
    },
    getMassPower() {
        let gain = E(1)
        if (player.unlocked.includes('black_hole')) gain = gain.mul(FUNCS.gains.black_hole.effect().pow)
        if (player.upgs.gp.includes(14)) gain = gain.mul(UPGS.gp[14].effect())
        if (FUNCS.hasBuyed('pp', 5) && CHALGREEK.ch() == 0) gain = gain.mul(UPGS.pp[5].effect())
        if (CHALGREEK[3].unl()) gain = gain.mul(CHALGREEK[3].effect())
        if (player.upgs.gp.includes(22)) gain = gain.pow(UPGS.gp[22].effect())
        if (CHALGREEK.ch() == 3 || CHALGREEK.ch() == 5) gain = gain.pow(0.0625)
        return gain
    },
    getPentogenPower() {
        let gain = E(1)
        if (MILESTONES.tetr[7].can()) gain = gain.add(MILESTONES.tetr[7].effect())
        return gain
    },
    getExMass() {
        if (!MILESTONES.multiverse[8].can()) return E(0)
        let gain = player.mass.add(1).log10()
        let mul = E(1)
        if (player.upgs.gp.includes(45)) for (let x = 1; x <= UPGS.EMM.cols; x++) mul = mul.add(UPGS.EMM[x].effect())
        return gain.mul(mul)
    },
    gains: {
        rage_powers: {
            points(){
                let gain = player.mass.div(1.619e23).add(1).log10().pow(2)
                if (player.upgs.gp.includes(11)) gain = player.mass.div(1.619e23).add(1).logBase(5).pow(3)
                if (player.upgs.rage_powers.includes(11)) gain = gain.mul(UPGS.rage_powers[11].effect())
                if (player.upgs.rage_powers.includes(21)) gain = gain.mul(UPGS.rage_powers[21].effect())
                if (player.upgs.adm.includes(11)) gain = gain.mul(UPGS.adm[11].effect())
                if (player.achs.includes(33)) gain = gain.mul(2)
                if (player.achs.includes(44)) gain = gain.mul(2)
                if (player.achs.includes(54)) gain = gain.mul(3)
                if (player.unlocked.includes('black_hole')) gain = gain.mul(FUNCS.gains.black_hole.effect().mul)
                if (player.upgs.gp.includes(13)) gain = gain.mul(UPGS.gp[13].effect())
                if (FUNCS.hasBuyed('pp', 2)) gain = gain.mul(UPGS.pp[2].effect())
                if (CHALGREEK[2].unl()) gain = gain.mul(CHALGREEK[2].effect())
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
                player.pent = E(1)
                FUNCS.pent.doReset()
            },
        },
        black_hole: {
            points(){
                let gain = player.rage_powers.pow(1/5).sub(10).max(0)
                if (player.upgs.gp.includes(52)) gain = player.rage_powers.pow(0.3).sub(10).max(0)
                if (player.unlocked.includes('antidark_matters')) gain = gain.mul(FUNCS.gains.antidark_matters.effect().mul)
                if (player.achs.includes(61)) gain = gain.mul(2)
                if (UPGS.ex_mass[4].unl()) gain = gain.pow(UPGS.ex_mass[4].effect())
                return gain.floor()
            },
            canReset(){ return this.points().gte(1) },
            reset(){
                if (this.canReset()) {
                    let gain = this.points()
                    player.black_hole.dm = player.black_hole.dm.add(gain)
                    player.black_hole.total_dm = player.black_hole.total_dm.add(gain)
                    if (player.tier.lte(1)) FUNCS.unlockAch(45)
                    this.doReset('bh')
                }
            },
            doReset(msg){
                player.rage_powers = E(0)
                if (!(msg == 'bh' && MILESTONES.dark_matter[4].can())) if (!(msg == 'adm' && MILESTONES.multiverse[5].can())) if (!(msg == 'mul' && MILESTONES.multiverse[7].can())) if (!(MILESTONES.multiverse[10].can() && msg == 'chalgreek')) player.upgs.rage_powers = []
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
                if (player.achs.includes(55)) gain = gain.mul(5)
                if (FUNCS.hasBuyed('dm', 1)) gain = gain.mul(UPGS.dm[1].effect())

                if (!player.black_hole.bh_activated) {
                    if (player.upgs.gp.includes(51)) gain = UPGS.gp[51].effect()
                    else gain = E(0)
                }
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
                FUNCS.gains.black_hole.doReset('adm')
            },
            effect(){
                let eff = {}

                eff.mul = player.black_hole.adm.add(1).pow(2/7)

                return eff
            },
        },
        gp() {
            let gain = E(2).pow(player.multiverse.number.sub(1)).sub(1)
            if (!MILESTONES.multiverse[2].can()) gain = E(0)

            if (player.upgs.gp.includes(33)) gain = gain.mul(UPGS.gp[33].effect())
            if (player.upgs.gp.includes(43)) gain = gain.mul(UPGS.gp[43].effect())
            if (FUNCS.hasBuyed('pp', 3)) gain = gain.mul(UPGS.pp[3].effect())
            return gain
        },
        pp() {
            let gain = player.rank.sub(1).pow(1/2)
            if (FUNCS.hasBuyed('pp', 4)) gain = gain.mul(UPGS.pp[4].effect())
            if (player.upgs.gp.includes(15)) gain = gain.mul(UPGS.gp[15].effect())
            if (UPGS.ex_mass[5].unl()) gain = gain.mul(UPGS.ex_mass[5].effect())
            if (MILESTONES.tier[8].can()) gain = gain.pow(1.25)
            return gain
        },
    },
    multiverse: {
        caps() {
            let num = player.multiverse.number
            let mass = E(2).pow(E(2).pow(E(9).add(num.pow(.8))))
            return E(1.5e56).mul(mass)
        },
        can() { return player.mass.gte(this.caps()) },
        reset() {
            if (this.can()) if (confirm('You wanted to perform to enter new Multiverse? Resets all previous features (except achievements). Are you ready?')) {
                player.multiverse.number = player.multiverse.number.add(1)
                this.doReset('mul')
            }
        },
        doReset(msg) {
            player.black_hole.dm = E(0)
            player.black_hole.total_dm = E(0)
            if ((MILESTONES.multiverse[2].can() && msg == 'mul') || (MILESTONES.multiverse[10].can() && msg == 'chalgreek')) player.black_hole.total_dm = E(640)
            if (!(MILESTONES.multiverse[7].can() && msg == 'mul')) {
                player.black_hole.adm = E(0)
                if (MILESTONES.multiverse[2].can() && msg == 'mul') player.black_hole.adm = E(200)
                if (!(MILESTONES.multiverse[10].can() && msg == 'chalgreek')) player.upgs.adm = []
            }
            
            player.upgs.dm = {}
            player.black_hole.stored_mass = E(0)
            player.black_hole.bh_activated = false
            if (!(MILESTONES.multiverse[4].can() && msg == 'mul')) if (!(MILESTONES.multiverse[10].can() && msg == 'chalgreek')) {
                player.upgs.gears = []
                player.automators.mass = false
                player.automators.rank = false
                player.automators.tier = false
                player.automators.tetr = false
                player.automators.pent = false
            }
            FUNCS.gains.black_hole.doReset(msg)
        },
    },
    msgs: {
        execute() { return player.black_hole.bh_activated?'Stop Execute Black Hole':'Start to Execute Black Hole' },
        multiverse() {
            return FUNCS.multiverse.can()
            ?(`Perform to Enter Multiverse #${format(player.multiverse.number.add(1),0)}`)
            :(`Push over this capacity to perform. (${format(player.mass.add(1).log10().div(FUNCS.multiverse.caps().add(1).log10()).mul(100).min(100))}%)`)
        },
        secret(msg, show) {
            return show?msg:'???'
        },
    },
}

const UPGS = {
    buy(name, id) {
        let cost = UPGS[name][id].cost()
        let can = false
        if (UPGS[name].parent != undefined) can = player[UPGS[name].parent][UPGS[name].res].gte(cost) && (UPGS[name].type == 'normal'?!player.upgs[name].includes(id):true)
        else can = player[UPGS[name].res].gte(cost) && (UPGS[name].type == 'normal'?!player.upgs[name].includes(id):true)
        if (can) {
            if (UPGS[name].parent != undefined) {if (!(name == 'dm' && MILESTONES.multiverse[8].can())) if (!(name == 'pp' && player.upgs.gp.includes(55))) player[UPGS[name].parent][UPGS[name].res] = player[UPGS[name].parent][UPGS[name].res].sub(cost)}
            else if (!(name == 'mass' && MILESTONES.multiverse[1].can())) player[UPGS[name].res] = player[UPGS[name].res].sub(cost)
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
        let cst = UPGS[name][id].cost(bulk)
        let can = false
        if (UPGS[name].parent != undefined) can = player[UPGS[name].parent][UPGS[name].res].gte(cst)
        else can = player[UPGS[name].res].gte(cst)
        if (can && bulk.add(1).gt(FUNCS.hasUpgrade(name, id))) {

            if (UPGS[name].parent != undefined) {if (!(name == 'dm' && MILESTONES.multiverse[8].can())) if (!(name == 'pp' && player.upgs.gp.includes(55))) player[UPGS[name].parent][UPGS[name].res] = player[UPGS[name].parent][UPGS[name].res].sub(cst)}
            else if (!(name == 'mass' && MILESTONES.multiverse[1].can())) player[UPGS[name].res] = player[UPGS[name].res].sub(cst)
            if (player.upgs[name][id] == undefined) player.upgs[name][id] = E(0)
            player.upgs[name][id] = bulk.add(1)
        }
    },
    buyMax(name, bulk=true) {
        for (let x = 1; x <= UPGS[name].cols; x++) if (UPGS[name][x].unl()) {
            if (bulk && UPGS[name][x].bulk != undefined) {
                UPGS.bulk(name, x)
                continue
            }
            UPGS.buy(name, x)
        }  
    },

    mass: {
        name: 'mass',
        type: 'buyables',
        res: 'mass',

        cols: 4,
        1: {
            unl() { return MILESTONES.rank[1].can() || MILESTONES.multiverse[1].can() },
            desc() { return 'Adds '+
                formatMass(
                    E(FUNCS.hasBuyed('mass', 2)?UPGS.mass[2].effect():1)
                    .mul(MILESTONES.rank[3].can()?MILESTONES.rank[3].effect():1)
                    .pow(MILESTONES.rank[7].can()?1.1:1)
                )
            +' gained mass.' },
            cost(x=FUNCS.hasUpgrade('mass', 1)) { return E(E(.5).mul(MILESTONES.rank[2].can()?0.85:1).sub(MILESTONES.tier[3].can()?0.2:0).add(1)).pow(x).mul(10).div(FUNCS.hasBuyed('mass', 4)?UPGS.mass[4].effect():1) },
            can() { return player.mass.gte(this.cost()) },
            effect() {
                let eff = E(1)
                if (FUNCS.hasBuyed('mass', 2)) eff = eff.mul(UPGS.mass[2].effect())
                if (MILESTONES.rank[3].can()) eff = eff.mul(MILESTONES.rank[3].effect())
                if (MILESTONES.rank[7].can()) eff = eff.pow(1.1)

                let lvl = FUNCS.hasUpgrade('mass', 1)
                if (MILESTONES.dark_matter[3].can()) lvl = lvl.add(player.black_hole.total_dm.mul(5))
                if (player.upgs.gp.includes(42)) lvl = lvl.add(UPGS.gp[42].effect())
                if (MILESTONES.tetr[4].can()) lvl = lvl.mul(1.05)
                return eff.mul(lvl)
            },
            effDesc(x=this.effect()) { return '+'+formatMass(x) },
            bulk(){
                return player.mass.mul(FUNCS.hasBuyed('mass', 4)?UPGS.mass[4].effect():1).div(10).add(1).logBase(E(.5).mul(MILESTONES.rank[2].can()?0.85:1).sub(MILESTONES.tier[3].can()?0.2:0).add(1)).floor()
            },
        },
        2: {
            unl() { return MILESTONES.rank[2].can() || MILESTONES.multiverse[1].can() },
            desc() { return 'Multiples mass upgrade 1 effect by '+format(
                    E(1.5).pow(FUNCS.hasBuyed('mass', 3)?UPGS.mass[3].effect():1)
                    .mul(MILESTONES.rank[5].can()?MILESTONES.rank[5].effect():1)
                    .mul(MILESTONES.tier[2].can()?MILESTONES.tier[2].effect():1)
                    , 2)+' (additive)' },
            cost(x=FUNCS.hasUpgrade('mass', 2)) { return E(5).mul(E(MILESTONES.rank[3].can()?0.9:1).sub(MILESTONES.tier[3].can()?0.2:0)).pow(x).mul(100).div(FUNCS.hasBuyed('mass', 4)?UPGS.mass[4].effect():1) },
            can() { return player.mass.gte(this.cost()) },
            effect() {
                let lvl = FUNCS.hasUpgrade('mass', 2)
                if (MILESTONES.dark_matter[3].can()) lvl = lvl.add(player.black_hole.total_dm.mul(5))
                if (player.upgs.gp.includes(42)) lvl = lvl.add(UPGS.gp[42].effect())
                if (MILESTONES.tetr[4].can()) lvl = lvl.mul(1.05)
                let eff = lvl.mul(E(1.5).pow(FUNCS.hasBuyed('mass', 3)?UPGS.mass[3].effect():1)
                .mul(MILESTONES.rank[5].can()?MILESTONES.rank[5].effect():1)
                .mul(MILESTONES.tier[2].can()?MILESTONES.tier[2].effect():1)).add(1)
                .pow(MILESTONES.rank[11].can()?1.025:1)
                return eff
            },
            effDesc(x=this.effect()) { return 'x'+format(x,1) },
            bulk(){
                return player.mass.mul(FUNCS.hasBuyed('mass', 4)?UPGS.mass[4].effect():1).div(100).add(1).logBase(E(5).mul(E(MILESTONES.rank[3].can()?0.9:1).sub(MILESTONES.tier[3].can()?0.2:0))).floor()
            },
        },
        3: {
            unl() { return MILESTONES.rank[3].can() || MILESTONES.multiverse[1].can() },
            desc() { return 'Raises mass upgrade 2 effect by '+format(E(MILESTONES.rank[5].can()?MILESTONES.rank[5].effect():1), 2)+' (additive)' },
            cost(x=FUNCS.hasUpgrade('mass', 3)) { return E(10).mul(E(MILESTONES.rank[7].can()?0.75:1).sub(MILESTONES.tier[3].can()?0.2:0)).pow(x).mul(1000).div(FUNCS.hasBuyed('mass', 4)?UPGS.mass[4].effect():1) },
            can() { return player.mass.gte(this.cost()) },
            effect() {
                let lvl = FUNCS.hasUpgrade('mass', 3)
                if (lvl.gte(10)) lvl = lvl.sub(10).pow(MILESTONES.rank[10].can()?0.775:3/4).add(10)
                if (lvl.gte(2000)) lvl = lvl.sub(2000).div(1.15).add(2000)
                if (lvl.gte(6900)) lvl = lvl.sub(6900).div(1.15).add(6900)
                if (lvl.gte(22500)) lvl = lvl.sub(22500).div(1.15).add(22500)
                if (lvl.gte(100000)) lvl = lvl.sub(100000).pow(0.6).add(100000)
                if (lvl.gte(1300000)) lvl = lvl.sub(1300000).pow(0.6).add(1300000)
                if (player.upgs.gp.includes(42)) lvl = lvl.add(UPGS.gp[42].effect())
                if (MILESTONES.tetr[2].can()) lvl = lvl.mul(1.2)
                if (MILESTONES.tetr[4].can()) lvl = lvl.mul(1.05)
                return lvl.add(1).add(MILESTONES.tier[4].can()?MILESTONES.tier[4].effect():0).mul(MILESTONES.rank[5].can()?MILESTONES.rank[5].effect():1)
            },
            effDesc(x=this.effect()) { return '^'+format(x,2) },
            bulk(){
                return player.mass.mul(FUNCS.hasBuyed('mass', 4)?UPGS.mass[4].effect():1).div(1000).add(1).logBase(E(10).mul(E(MILESTONES.rank[7].can()?0.75:1).sub(MILESTONES.tier[3].can()?0.2:0))).floor()
            },
        },
        4: {
            unl() { return MILESTONES.tier[5].can() },
            desc() { return 'Divides all previous mass upgrades cost.' },
            cost(x=FUNCS.hasUpgrade('mass', 4)) { return E(1e3*(MILESTONES.tetr[3].can()?0.85:1)).pow(x).mul(1e3) },
            can() { return player.mass.gte(this.cost()) },
            effect() {
                let lvl = FUNCS.hasUpgrade('mass', 4)
                if (player.upgs.gp.includes(42)) lvl = lvl.add(UPGS.gp[42].effect())
                if (MILESTONES.tetr[4].can()) lvl = lvl.mul(1.05)
                if (MILESTONES.tetr[6].can()) lvl = lvl.mul(1.1)
                if (MILESTONES.pent[2].can()) lvl = lvl.add(MILESTONES.pent[2].effect())
                if (UPGS.ex_mass[1].unl()) lvl = lvl.pow(UPGS.ex_mass[1].effect())
                return E(1.75).pow(lvl)
            },
            effDesc(x=this.effect()) { return '/'+format(x,0) },
            bulk(){
                return player.mass.div(1e3).add(1).logBase(1e3*(MILESTONES.tetr[3].can()?0.85:1)).floor()
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
                if (player.upgs.gp.includes(31)) eff = eff.mul(UPGS.gp[31].effect())
                if (UPGS.ex_mass[2].unl()) eff = eff.mul(UPGS.ex_mass[2].effect())
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
                if (eff.gte(1.5)) eff = eff.sub(.5).pow(1/3).add(.5)
                if (eff.gte(10)) eff = eff.sub(10).pow(1/3).add(10)
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
            cost(x=FUNCS.hasUpgrade('dm', 1)) {
                let cost = E(2).pow(x).pow(0.75).div(player.upgs.gp.includes(23)?UPGS.gp[23].effect():1)
                return cost.ceil()
            },
            can() { return player.black_hole.dm.gte(this.cost()) },
            effect() {
                let lvl = FUNCS.hasUpgrade('dm', 1)
                if (lvl.gte(10)) lvl = lvl.sub(10).pow(1/3).add(10)
                if (FUNCS.hasBuyed('pp', 6)) lvl = lvl.add(UPGS.pp[6].effect())
                return E(1.5).pow(lvl).pow(FUNCS.hasBuyed('dm', 3)?UPGS.dm[3].effect():1)
            },
            effDesc(x=this.effect()) { return 'x'+format(x, 2) },
            bulk() { return player.black_hole.dm.mul(player.upgs.gp.includes(23)?UPGS.gp[23].effect():1).pow(1/0.75).add(1).logBase(2).floor() },
        },
        2: {
            unl() { return MILESTONES.dark_matter[1].can() },
            desc() { return 'Multiples stored mass in Black Hole effect.' },
            cost(x=FUNCS.hasUpgrade('dm', 2)) { return E(2).pow(x).pow(0.75).div(player.upgs.gp.includes(23)?UPGS.gp[23].effect():1).ceil() },
            can() { return player.black_hole.dm.gte(this.cost()) },
            effect() {
                let lvl = FUNCS.hasUpgrade('dm', 2)
                if (lvl.gte(10)) lvl = lvl.sub(10).pow(1/2).add(10)
                if (FUNCS.hasBuyed('pp', 6)) lvl = lvl.add(UPGS.pp[6].effect())
                return E(1.25).pow(lvl).pow(FUNCS.hasBuyed('dm', 3)?UPGS.dm[3].effect():1)
            },
            effDesc(x=this.effect()) { return 'x'+format(x, 2) },
            bulk() { return player.black_hole.dm.mul(player.upgs.gp.includes(23)?UPGS.gp[23].effect():1).pow(1/0.75).add(1).logBase(2).floor() },
        },
        3: {
            unl() { return MILESTONES.dark_matter[5].can() },
            desc() { return 'Raises all these prevoius upgrades effects.' },
            cost(x=FUNCS.hasUpgrade('dm', 3)) { return x.add(1).pow(1.5).mul(2).div(player.upgs.gp.includes(23)?UPGS.gp[23].effect():1).floor() },
            can() { return player.black_hole.dm.gte(this.cost()) },
            effect() {
                let lvl = FUNCS.hasUpgrade('dm', 3)
                if (lvl.gte(10000)) lvl = lvl.sub(10000).pow(3/4).add(10000)
                
                let eff = lvl.add(1).pow(1.4/4)
                if (eff.gte(1000)) eff = eff.sub(1000).div(4).add(1000)
                if (eff.gte(10000)) eff = eff.sub(10000).div(16).add(10000)
                if (eff.gte(100000)) eff = eff.sub(100000).div(64).add(100000)
                if (eff.gte(150000)) eff = eff.sub(150000).pow(0.38).add(150000)
                if (eff.gte(300000)) eff = eff.sub(300000).pow(0.5).add(300000)
                if (eff.gte(2000000)) eff = eff.sub(2000000).pow(0.5).add(2000000)
                if (CHALGREEK.ch() == 2 || CHALGREEK.ch() == 5) eff = E(0)
                return eff
            },
            effDesc(x=this.effect()) { return '^'+format(x, 2) },
            bulk() { return player.black_hole.dm.mul(player.upgs.gp.includes(23)?UPGS.gp[23].effect():1).div(2).pow(2/3).sub(1).floor() },
        },
    },
    adm: {
        name: 'adm',
        parent: 'black_hole',
        type: 'normal',
        res: 'adm',

        cols: 3,
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
        13: {
            unl() { return MILESTONES.multiverse[5].can() },
            desc() { return 'Adds Rank 40 softcap starts later based on ADM.' },
            cost() { return E(500000) },
            can() { return player.black_hole.adm.gte(this.cost()) },
            effect() {
                let eff = player.black_hole.adm.add(1).logBase(5).pow(2.25).floor()
                return eff
            },
            effDesc(x=this.effect()) { return "+"+format(x,0) },
        },
    },
    gp: {
        /*
        11: {
            unl() { return MILESTONES.multiverse[4].can() },
            desc() { return 'Placeholder.' },
            cost() { return E(1/0) },
            can() { return player.multiverse.gp.gte(this.cost()) },
            effect() {
                let eff = E(1)
                return eff
            },
            effDesc(x=this.effect()) { return 'x'+format(x, 3) },
        },
        */
        name: 'gp',
        parent: 'multiverse',
        type: 'normal',
        res: 'gp',

        cols: 5,
        rows: 5,

        11: {
            unl() { return MILESTONES.multiverse[2].can() },
            desc() { return 'Rage Powers gain formula is better. [log10(x/1.619e23+1)^2 → log5(x/1.619e23+1)^3]' },
            cost() { return E(1000) },
            can() { return player.multiverse.gp.gte(this.cost()) },
        },
        12: {
            unl() { return MILESTONES.multiverse[3].can() },
            desc() { return 'Unlock auto-Tetr.' },
            cost() { return E(7500) },
            can() { return player.multiverse.gp.gte(this.cost()) && player.upgs.gp.includes(11) },
        },
        13: {
            unl() { return MILESTONES.multiverse[4].can() },
            desc() { return 'Gain more RP based on ranks.' },
            cost() { return E(40000) },
            can() { return player.multiverse.gp.gte(this.cost()) && player.upgs.gp.includes(22) },
            effect() {
                let eff = player.rank.add(1).pow(.8)
                return eff
            },
            effDesc(x=this.effect()) { return 'x'+format(x, 3) },
        },
        14: {
            unl() { return MILESTONES.multiverse[5].can() },
            desc() { return 'Rank boost Mass Power.' },
            cost() { return E(6250000) },
            can() { return player.multiverse.gp.gte(this.cost()) && player.upgs.gp.includes(33) },
            effect() {
                let eff = E(1.05).pow(player.rank.sub(1))
                return eff
            },
            effDesc(x=this.effect()) { return 'x'+format(x, 3) },
        },
        15: {
            unl() { return MILESTONES.multiverse[7].can() },
            desc() { return 'Gain more Pentogen Powers based on GP.' },
            cost() { return E(1e15) },
            can() { return player.multiverse.gp.gte(this.cost()) },
            effect() {
                let eff = player.multiverse.gp.add(1).log10().mul(2).add(1)
                return eff
            },
            effDesc(x=this.effect()) { return 'x'+format(x) },
        },

        21: {
            unl() { return MILESTONES.multiverse[3].can() },
            desc() { return 'Gears gain formula is better. [log10(x+1)^0.75 → log5(x+1)^3]' },
            cost() { return E(7500) },
            can() { return player.multiverse.gp.gte(this.cost()) && player.upgs.gp.includes(11) },
        },
        22: {
            unl() { return MILESTONES.multiverse[3].can() },
            desc() { return 'Mass Power is raised based on unspent Grid Powers.' },
            cost() { return E(15000) },
            can() { return player.multiverse.gp.gte(this.cost()) && player.upgs.gp.includes(12) && player.upgs.gp.includes(21) },
            effect() {
                let eff = player.multiverse.gp.add(1).log10().add(1).pow(0.08)
                return eff
            },
            effDesc(x=this.effect()) { return '^'+format(x, 3) },
        },
        23: {
            unl() { return MILESTONES.multiverse[4].can() },
            desc() { return 'Upgrades in Black Hole cost is divided based on Grid Powers.' },
            cost() { return E(90000) },
            can() { return player.multiverse.gp.gte(this.cost()) && player.upgs.gp.includes(22) },
            effect() {
                let eff = player.multiverse.gp.add(1).log10().add(1).pow(0.75)
                return eff
            },
            effDesc(x=this.effect()) { return '/'+format(x, 3) },
        },
        24: {
            unl() { return MILESTONES.multiverse[5].can() },
            desc() { return 'Tetr doesn’t reset.' },
            cost() { return E(1.6e7) },
            can() { return player.multiverse.gp.gte(this.cost()) && player.upgs.gp.includes(14) },
        },
        25: {
            unl() { return MILESTONES.multiverse[7].can() },
            desc() { return 'Pentogen Upgrade 1 & 5 are stronger.' },
            cost() { return E(1e25) },
            can() { return player.multiverse.gp.gte(this.cost()) },
        },

        31: {
            unl() { return MILESTONES.multiverse[4].can() },
            desc() { return 'RP upgrade 1:3 effect is multiplied based on tiers.' },
            cost() { return E(40000) },
            can() { return player.multiverse.gp.gte(this.cost()) && player.upgs.gp.includes(22) },
            effect() {
                let eff = player.tier.add(1).pow(.5)
                return eff
            },
            effDesc(x=this.effect()) { return 'x'+format(x, 3) },
        },
        32: {
            unl() { return MILESTONES.multiverse[4].can() },
            desc() { return 'Mass Power can affect stored mass in Black Hole gain.' },
            cost() { return E(90000) },
            can() { return player.multiverse.gp.gte(this.cost()) && player.upgs.gp.includes(22) },
        },
        33: {
            unl() { return MILESTONES.multiverse[4].can() },
            desc() { return 'Mass Power boosts Grid Powers gain.' },
            cost() { return E(160000) },
            can() { return player.multiverse.gp.gte(this.cost()) && player.upgs.gp.includes(13) && player.upgs.gp.includes(23) && player.upgs.gp.includes(31) && player.upgs.gp.includes(32) },
            effect() {
                let eff = FUNCS.getMassPower().add(1).log10().add(1).pow(0.5)
                return eff
            },
            effDesc(x=this.effect()) { return 'x'+format(x, 3) },
        },
        34: {
            unl() { return MILESTONES.multiverse[5].can() },
            desc() { return 'Gain 10% of Dark Matters gain per second.' },
            cost() { return E(1e8) },
            can() { return player.multiverse.gp.gte(this.cost()) && player.upgs.gp.includes(24) },
        },
        35: {
            unl() { return MILESTONES.multiverse[7].can() },
            desc() { return 'Gain 10% of Anti-Dark Matters gain per second.' },
            cost() { return E(1e38) },
            can() { return player.multiverse.gp.gte(this.cost()) },
        },

        41: {
            unl() { return MILESTONES.multiverse[5].can() },
            desc() { return 'Rank 40 softcap starts later based on the Multiverse number.' },
            cost() { return E(6250000) },
            can() { return player.multiverse.gp.gte(this.cost()) && player.upgs.gp.includes(33) },
            effect() {
                let eff = player.multiverse.number.pow(2)
                return eff.floor()
            },
            effDesc(x=this.effect()) { return '+'+format(x, 0) },
        },
        42: {
            unl() { return MILESTONES.multiverse[5].can() },
            desc() { return 'Gain free mass upgrades 1-4 based on Tetrs.' },
            cost() { return E(1.6e7) },
            can() { return player.multiverse.gp.gte(this.cost()) && player.upgs.gp.includes(41) },
            effect() {
                let eff = player.tetr.pow(2)
                return eff.floor()
            },
            effDesc(x=this.effect()) { return '+'+format(x, 0) },
        },
        43: {
            unl() { return MILESTONES.multiverse[5].can() },
            desc() { return 'Mass boost Grid Powers gain.' },
            cost() { return E(1e8) },
            can() { return player.multiverse.gp.gte(this.cost()) && player.upgs.gp.includes(42) },
            effect() {
                let eff = player.mass.add(1).log10().add(1).pow(1/8)
                return eff
            },
            effDesc(x=this.effect()) { return 'x'+format(x, 3) },
        },
        44: {
            unl() { return MILESTONES.multiverse[5].can() },
            desc() { return 'Tier 10 effect is stronger based on Multiverse number.' },
            cost() { return E(1e9) },
            can() { return player.multiverse.gp.gte(this.cost()) && player.upgs.gp.includes(34) && player.upgs.gp.includes(43) },
            effect() {
                let eff = player.multiverse.number.pow(0.1)
                return eff
            },
            effDesc(x=this.effect()) { return format(x.sub(1).mul(100), 2)+"%" },
        },
        45: {
            unl() { return MILESTONES.multiverse[7].can() },
            desc() { return 'Unlock Ex-Mass multiplier.' },
            cost() { return E(1e79) },
            can() { return player.multiverse.gp.gte(this.cost()) },
        },

        51: {
            unl() { return MILESTONES.multiverse[7].can() },
            desc() { return 'You can gain stored mass passive in Black Hole without extracting Black Hole.' },
            cost() { return E(1e15) },
            can() { return player.multiverse.gp.gte(this.cost()) },
            effect() {
                let eff = (FUNCS.hasBuyed('dm', 1)?UPGS.dm[1].effect():E(1)).pow(3)
                return eff
            },
            effDesc(x=this.effect()) { return '+'+formatMass(x)+'/s' },
        },
        52: {
            unl() { return MILESTONES.multiverse[7].can() },
            desc() { return 'DM gain formula is better. [x^0.2 → x^0.3]' },
            cost() { return E(1e20) },
            can() { return player.multiverse.gp.gte(this.cost()) },
        },
        53: {
            unl() { return MILESTONES.multiverse[7].can() },
            desc() { return 'Unlock Auto-buy DM upgrades.' },
            cost() { return E(1e29) },
            can() { return player.multiverse.gp.gte(this.cost()) },
        },
        54: {
            unl() { return MILESTONES.multiverse[7].can() },
            desc() { return 'Unlock Pent.' },
            cost() { return E(1e55) },
            can() { return player.multiverse.gp.gte(this.cost()) },
        },
        55: {
            unl() { return MILESTONES.multiverse[7].can() },
            desc() { return 'Unlock Challenge Epsilon. Pentogen Upgrades no longer buys PP.' },
            cost() { return E(1e88) },
            can() { return player.multiverse.gp.gte(this.cost()) },
        },
    },
    pp: {
        name: 'pp',
        parent: 'multiverse',
        type: 'buyables',
        res: 'pp',

        cols: 6,
        1: {
            unl() { return MILESTONES.multiverse[6].can() },
            desc() { return 'Multiples mass gain.' },
            cost(x=FUNCS.hasUpgrade('pp', 1)) {
                let cost = E(2).pow(x).mul(25)
                return cost.floor()
            },
            can() { return player.multiverse.pp.gte(this.cost()) },
            effect() {
                let lvl = FUNCS.hasUpgrade('pp', 1)
                lvl = lvl.mul(FUNCS.getPentogenPower())
                if (player.upgs.gp.includes(25)) lvl = lvl.pow(3)
                return E(100).pow(lvl)
            },
            effDesc(x=this.effect()) { return 'x'+format(x, 2) },
            bulk() { return player.multiverse.pp.div(25).add(1).logBase(2).floor() },
        },
        2: {
            unl() { return MILESTONES.multiverse[6].can() },
            desc() { return 'Multiples RP gain.' },
            cost(x=FUNCS.hasUpgrade('pp', 2)) {
                let cost = E(3).pow(x).mul(30)
                return cost.floor()
            },
            can() { return player.multiverse.pp.gte(this.cost()) },
            effect() {
                let lvl = FUNCS.hasUpgrade('pp', 2)
                lvl = lvl.mul(FUNCS.getPentogenPower())
                return E(5).pow(lvl)
            },
            effDesc(x=this.effect()) { return 'x'+format(x, 2) },
            bulk() { return player.multiverse.pp.div(30).add(1).logBase(3).floor() },
        },
        3: {
            unl() { return MILESTONES.multiverse[6].can() },
            desc() { return 'Multiples GP gain.' },
            cost(x=FUNCS.hasUpgrade('pp', 3)) {
                let cost = E(4).pow(x).mul(100)
                return cost.floor()
            },
            can() { return player.multiverse.pp.gte(this.cost()) },
            effect() {
                let lvl = FUNCS.hasUpgrade('pp', 3)
                lvl = lvl.mul(FUNCS.getPentogenPower())
                return E(3).pow(lvl)
            },
            effDesc(x=this.effect()) { return 'x'+format(x, 2) },
            bulk() { return player.multiverse.pp.div(100).add(1).logBase(4).floor() },
        },
        4: {
            unl() { return MILESTONES.multiverse[6].can() },
            desc() { return 'Multiples PP gain.' },
            cost(x=FUNCS.hasUpgrade('pp', 4)) {
                let cost = E(5).pow(x).mul(1000)
                return cost.floor()
            },
            can() { return player.multiverse.pp.gte(this.cost()) },
            effect() {
                let lvl = FUNCS.hasUpgrade('pp', 4)
                if (lvl.gte(40)) lvl = lvl.sub(40).pow(MILESTONES.pent[3].can()?0.6:0.4).add(40)
                lvl = lvl.mul(FUNCS.getPentogenPower())
                return E(2).pow(lvl)
            },
            effDesc(x=this.effect()) { return 'x'+format(x, 2) },
            bulk() { return player.multiverse.pp.div(1000).add(1).logBase(5).floor() },
        },
        5: {
            unl() { return MILESTONES.multiverse[7].can() },
            desc() { return 'Multiples Mass Power based on mass.' },
            cost(x=FUNCS.hasUpgrade('pp', 5)) {
                let cost = E(7.5).pow(x).mul(1e5)
                return cost.floor()
            },
            can() { return player.multiverse.pp.gte(this.cost()) },
            effect() {
                let lvl = FUNCS.hasUpgrade('pp', 5)
                if (lvl.gte(40)) lvl = lvl.sub(40).pow(0.8).add(40)
                lvl = lvl.mul(FUNCS.getPentogenPower())
                if (player.upgs.gp.includes(25)) lvl = lvl.pow(4)

                let eff = player.mass.add(1).pow(0.001).pow(lvl.pow(1/3))
                if (eff.gte('e5e9')) eff = eff.div('e5e9').pow(1/3).mul('e5e9')
                return eff
            },
            effDesc(x=this.effect()) { return 'x'+format(x, 2) },
            bulk() { return player.multiverse.pp.div(1e5).add(1).logBase(7.5).floor() },
        },
        6: {
            unl() { return MILESTONES.multiverse[7].can() },
            desc() { return 'Gain free DM upgrades 1-2 based on PP.' },
            cost(x=FUNCS.hasUpgrade('pp', 6)) {
                let cost = E(10).pow(x).mul(5e5)
                return cost.floor()
            },
            can() { return player.multiverse.pp.gte(this.cost()) },
            effect() {
                let lvl = FUNCS.hasUpgrade('pp', 6)
                lvl = lvl.mul(FUNCS.getPentogenPower())

                let eff = player.multiverse.pp.add(1).log10().add(1).pow(lvl.pow(0.4)).sub(1)
                let soft = FUNCS.hasUpgrade('dm', 1).max(FUNCS.hasUpgrade('dm', 2))
                if (eff.gte(soft)) eff = eff.sub(soft).pow(1/2).add(soft)
                soft = soft.mul(2)
                if (eff.gte(soft)) eff = eff.sub(soft).pow(1/2).add(soft)
                return eff.floor()
            },
            effDesc(x=this.effect()) { return '+'+format(x, 0) },
            bulk() { return player.multiverse.pp.div(5e5).add(1).logBase(10).floor() },
        },
    },
    ex_mass: {
        cols: 5,

        1: {
            unl() { return MILESTONES.multiverse[8].can() },
            desc() { return `Mass Upgrade 4 effect is stronger by` },
            effect() {
                let eff = FUNCS.getExMass().add(1).pow(0.025)
                return eff
            },
            effDesc(x=this.effect()) { return `^${format(x)}` }
        },
        2: {
            unl() { return FUNCS.getExMass().gte(11000000) },
            desc() { return `Multiples RP upgrade 3 effects by` },
            effect() {
                let eff = FUNCS.getExMass().add(1).pow(0.2)
                return eff
            },
            effDesc(x=this.effect()) { return `x${format(x)}` }
        },
        3: {
            unl() { return FUNCS.getExMass().gte(33000000) },
            desc() { return `Substracts tier requirement by` },
            effect() {
                let eff = FUNCS.getExMass().pow(0.25).mul(2)
                return eff
            },
            effDesc(x=this.effect()) { return `-${format(x)}` }
        },
        4: {
            unl() { return FUNCS.getExMass().gte(4.725e9) },
            desc() { return `Raises DM gain by` },
            effect() {
                let eff = FUNCS.getExMass().add(1).pow(1/400)
                return eff
            },
            effDesc(x=this.effect()) { return `^${format(x)}` }
        },
        5: {
            unl() { return FUNCS.getExMass().gte(4e11) },
            desc() { return `Multiples PP gain by` },
            effect() {
                let eff = FUNCS.getExMass().add(1).pow(0.1)
                return eff
            },
            effDesc(x=this.effect()) { return `x${format(x)}` }
        },
    },
    EMM: {
        count(x) {
            if (player.multiverse.EMM[x] != undefined) return player.multiverse.EMM[x]
            else return E(0)
        },
        buy(x) {
            if (this[x].can()) {
                if (player.multiverse.EMM[x] == undefined) player.multiverse.EMM[x] = E(0)
                player.multiverse.EMM[x] = player.multiverse.EMM[x].add(1)
            }
        },

        cols: 4,
        1: {
            name: 'RP',
            cost() { return E(1e50).pow(UPGS.EMM.count(1)).mul(1e100) },
            costDesc(x=this.cost()) { return format(x, 0) },
            can() { return player.rage_powers.gte(this.cost()) },
            effect() { return E(0.25).mul(UPGS.EMM.count(1)) },
        },
        2: {
            name: 'DM',
            cost() { return E(1e25).pow(UPGS.EMM.count(2)).mul(1e25) },
            costDesc(x=this.cost()) { return format(x, 0) },
            can() { return player.black_hole.dm.gte(this.cost()) },
            effect() { return E(0.25).mul(UPGS.EMM.count(2)) },
        },
        3: {
            name: 'PP',
            cost() { return E(1e10).pow(UPGS.EMM.count(3)).mul(1e10) },
            costDesc(x=this.cost()) { return format(x, 0) },
            can() { return player.multiverse.pp.gte(this.cost()) },
            effect() { return E(0.25).mul(UPGS.EMM.count(3)) },
        },
        4: {
            name: 'in Black Hole',
            cost() { return E('e100000000').pow(UPGS.EMM.count(4).add(1)).mul(1.5e56) },
            costDesc(x=this.cost()) { return formatMass(x) },
            can() { return player.black_hole.stored_mass.gte(this.cost()) },
            effect() { return E(0.25).mul(UPGS.EMM.count(4)) },
        },
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
            desc() { return `Unlock third upgrade. Reduce mass upgrade 2 cost scaled by 15%. Mass upgrade 1 level boost this effect (+${format(this.effect(),0)} to level).` },
            req() { return E(4) },
            can() { return player.rank.gte(this.req()) },
            effect() {
                let eff = FUNCS.hasUpgrade('mass', 1).div(5).add(1)
                return eff
            },
        },
        4: {
            desc() { return 'Raise mass gain by 1.25.' },
            req() { return E(5) },
            can() { return player.rank.gte(this.req()) },
        },
        5: {
            desc() { return `Multiples mass upgrades 2-3 effects based on ranks (x${format(this.effect(),2)}).` },
            req() { return E(6) },
            can() { return player.rank.gte(this.req()) },
            effect() {
                let eff = player.rank.add(1).pow(MILESTONES.rank[9].can()?9/20:2/5)
                return eff
            },
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
            desc() { return `For every rank (start at 40) multiples mass gain by ${format(this.effect(), 2)}, but will softcap at 100.` },
            req() { return E(40) },
            can() { return player.rank.gte(this.req()) },
            effect() {
                let t = MILESTONES.tier[6].can()?player.tier.div(7.5):E(0)
                if (player.upgs.gp.includes(44)) t = t.mul(UPGS.gp[44].effect())
                return E(2).add(t)
            },
        },
    },
    tier: {
        rows: 8,
        1: {
            desc() { return 'Reduce rank reqirements by 20%.' },
            req() { return E(2) },
            can() { return player.tier.gte(this.req()) },
        },
        2: {
            desc() { return `Mass upgrade 2 level boost this effect (x${format(this.effect(),0)} to level).` },
            req() { return E(3) },
            can() { return player.tier.gte(this.req()) },
            effect() {
                let eff = FUNCS.hasUpgrade('mass', 2).div(5).add(1)
                return eff
            },
        },
        3: {
            desc() { return 'Reduce mass upgrade 1-3 cost scaled by 20%.' },
            req() { return E(4) },
            can() { return player.tier.gte(this.req()) },
        },
        4: {
            desc() { return `Gain free mass upgrade 3 levels based on ranks (+${format(this.effect(),0)} to level).` },
            req() { return E(5) },
            can() { return player.tier.gte(this.req()) },
            effect() {
                let eff = player.rank.pow(0.525)
                return eff
            },
        },
        5: {
            desc() { return 'Unlock fourth mass upgrade, called "cheaper".' },
            req() { return E(7) },
            can() { return player.tier.gte(this.req()) },
        },
        6: {
            desc() { return 'Rank 40 effect is stronger based on tiers.' },
            req() { return E(10) },
            can() { return player.tier.gte(this.req()) },
        },
        7: {
            desc() { return 'Increase Rank 40 softcap based on tiers (starts at 80).' },
            req() { return E(80) },
            can() { return player.tier.gte(this.req()) },
        },
        8: {
            desc() { return 'Raise PP gain by 1.25.' },
            req() { return E(512) },
            can() { return player.tier.gte(this.req()) },
        },
    },
    tetr: {
        rows: 8,
        1: {
            desc() { return 'Reduce tier reqirements by 10%.' },
            req() { return E(2) },
            can() { return player.tetr.gte(this.req()) },
        },
        2: {
            desc() { return `Mass upgrade 3 level boost this effect (+${format(this.effect(),0)} to level).` },
            req() { return E(3) },
            can() { return player.tetr.gte(this.req()) },
            effect() {
                let eff = FUNCS.hasUpgrade('mass', 3).div(5).add(1)
                return eff
            },
        },
        3: {
            desc() { return 'Reduce mass upgrade 4 cost scaled by 15%.' },
            req() { return E(4) },
            can() { return player.tetr.gte(this.req()) },
        },
        4: {
            desc() { return 'Mass upgrades 1-4 are 5% stronger.' },
            req() { return E(5) },
            can() { return player.tetr.gte(this.req()) },
        },
        5: {
            desc() { return 'Increase Rank 40 softcap by 100.' },
            req() { return E(7) },
            can() { return player.tetr.gte(this.req()) },
        },
        6: {
            desc() { return 'Mass upgrade 4 are x1.1 stronger.' },
            req() { return E(10) },
            can() { return player.tetr.gte(this.req()) },
        },
        7: {
            desc() { return `Increase Pentogen upgrade Power based on Tetrs (+${format(this.effect().mul(100),1)}%).` },
            req() { return E(15) },
            can() { return player.tetr.gte(this.req()) },
            effect() {
                let eff = player.tetr.div(75)
                if (eff.gte(.25)) eff = eff.sub(.25).div(1.5).add(.25)
                return eff
            },
        },
        8: {
            desc() { return 'Raise mass gain by 1.1.' },
            req() { return E(27) },
            can() { return player.tetr.gte(this.req()) },
        },
    },
    pent: {
        rows: 3,
        1: {
            desc() { return 'Reduce tetr reqirements by 5%.' },
            req() { return E(3) },
            can() { return player.pent.gte(this.req()) },
        },
        2: {
            desc() { return `Mass upgrade 4 level boost this effect (+${format(this.effect(),0)} to level).` },
            req() { return E(4) },
            can() { return player.pent.gte(this.req()) },
            effect() {
                let eff = FUNCS.hasUpgrade('mass', 4).div(5).add(1)
                return eff
            },
        },
        3: {
            desc() { return 'Pentogen upgrades 4 softcap are weaker.' },
            req() { return E(5) },
            can() { return player.pent.gte(this.req()) },
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
            desc() { return `Gain free mass upgrade 1-2 based on total Dark Matters (+${format(this.effect(),0)} to level).` },
            req() { return E(15) },
            can() { return player.black_hole.total_dm.gte(this.req()) },
            effect() {
                let eff = player.black_hole.total_dm.mul(5)
                return eff
            },
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
    multiverse: {
        rows: 10,
        0: {
            desc() { return 'Tsss secret.' },
            req() { return E(1) },
            can() { return player.multiverse.number.gte(this.req()) },
        },
        1: {
            desc() { return 'Unlock Tetr (need more Tiers to reset for new Tetr), and button “buy max” in Black Hole Extractor, start with all mass upgrades unlocked (except fourth mass upgrade). Mass upgrades no longer buy mass.' },
            req() { return E(2) },
            can() { return player.multiverse.number.gte(this.req()) },
        },
        2: {
            desc() { return 'Unlock Grid Upgrades, start with 1-6th DM milestones unlocked and 200 Anti-DMs.' },
            req() { return E(3) },
            can() { return player.multiverse.number.gte(this.req()) },
        },
        3: {
            desc() { return 'Unlock 3 more Grid upgrades. You can break mass capacity and bulk rank.' },
            req() { return E(5) },
            can() { return player.multiverse.number.gte(this.req()) },
        },
        4: {
            desc() { return 'Unlock 5 more Grid upgrades. Keep gears upgrades on reset.' },
            req() { return E(8) },
            can() { return player.multiverse.number.gte(this.req()) },
        },
        5: {
            desc() { return 'Unlock more Grid upgrades and ADM upgrade. Anti-Dark Matters doesn’t reset RP upgrades.' },
            req() { return E(13) },
            can() { return player.multiverse.number.gte(this.req()) },
        },
        6: {
            desc() { return 'Unlock “Pentogen” (alternative version (universe) of Jacorb’s game “Distance Incremental” - Pathogen).' },
            req() { return E(18) },
            can() { return player.multiverse.number.gte(this.req()) },
        },
        7: {
            desc() { return 'Unlock more Grid upgrades. Keep Rage Powers upgrades, Anti-Dark Matters on reset. You can bulk tier.' },
            req() { return E(22) },
            can() { return player.multiverse.number.gte(this.req()) },
        },
        8: {
            desc() { return 'Unlock Ex-Mass. DM upgrades no longer spend your DM.' },
            req() { return E(32) },
            can() { return player.multiverse.number.gte(this.req()) },
        },
        9: {
            desc() { return 'Unlock auto-Pent, you can bulk Tetr.' },
            req() { return E(44) },
            can() { return player.multiverse.number.gte(this.req()) },
        },
        10: {
            desc() { return 'Keep Gear, RP & ADM upgrades on entering any challenge in ChallenGreek.' },
            req() { return E(49) },
            can() { return player.multiverse.number.gte(this.req()) },
        },
    },
}

const ACHIEVEMENTS = {
    cols: 5,
    rows: 6,
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
    35: {
        title: 'New Era of Tiers',
        desc() { return `Reach Tetr 3.` },
        can() { return player.tetr.gte(3) },
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
    45: {
        title: 'No problem here',
        desc() { return `Transform to DM with only Tier 1.` },
        can() { return false },
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
    54: {
        title: 'GLANT BLACK HOLE',
        desc() { return `Gain 100,000 total Dark Matters.` },
        can() { return player.black_hole.total_dm.gte(100000) },
    },
    55: {
        title: 'Googol Fat Black Hole',
        desc() { return `Get ${formatMass(1e100*1.5e56)} of stored mass in Black Hole. Reward: 5x stored mass gain.` },
        can() { return player.black_hole.stored_mass.gte(1e100*1.5e56) },
    },
    61: {
        title: 'NEW MULTIVERSE!!',
        desc() { return `Perform to Enter Multiverse #2. Reward: Double DM gain.` },
        can() { return player.multiverse.number.gte(2) },
    },
    62: {
        title: "#2, #3 & #5 milestone isn't not prime?",
        desc() { return `Perform to Enter Multiverse #5.` },
        can() { return player.multiverse.number.gte(5) },
    },
    63: {
        title: "more universe",
        desc() { return `Get ${formatMass(1.5e81)} of stored mass in Black Hole.` },
        can() { return player.black_hole.stored_mass.gte(1.5e81) },
    },
    64: {
        title: "10! Dark Matters!",
        desc() { return `Gain ${format(1*2*3*4*5*6*7*8*9*10)} total Dark Matters.` },
        can() { return player.black_hole.total_dm.gte(1*2*3*4*5*6*7*8*9*10) },
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
    if (ex.isInfinite()) return '∞ mlt'
    if (ex.gte(E(1.5e56).mul('ee9'))) return format(ex.div(1.5e56).log10().div(1e9), 4) + ' mlt'
    if (ex.gte(1.5e56)) return format(ex.div(1.5e56), 1) + ' uni'
    if (ex.gte(2.9835e45)) return format(ex.div(2.9835e45), 1) + ' MMWG'
    if (ex.gte(1.989e33)) return format(ex.div(1.989e33), 1) + ' M☉'
    if (ex.gte(5.972e27)) return format(ex.div(5.972e27), 1) + ' M⊕'
    if (ex.gte(1.619e20)) return format(ex.div(1.619e20), 1) + ' MME'
    if (ex.gte(1e6)) return format(ex.div(1e6), 1) + ' tonne'
    if (ex.gte(1e3)) return format(ex.div(1e3), 1) + ' kg'
    return format(ex, 1) + ' g'
}

function romanize(num) {
    num = Number(num)
    if (isNaN(num))
        return NaN;
    var digits = String(+num).split(""),
        key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
               "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
               "","I","II","III","IV","V","VI","VII","VIII","IX"],
        roman = "",
        i = 3;
    while (i--)
        roman = (key[+digits.pop() + (i * 10)] || "") + roman;
    return Array(+digits.join("") + 1).join("M") + roman;
}

function greekAlp(x) {
    let str = 'αβγδεζηθικλμνξοπρςτυφχψω'
    return str[Number(x-1)]
}

setInterval(loop, 50)