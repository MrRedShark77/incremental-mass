var diff = 0;
var date = Date.now();
var player

const TABS = {
    1: [
        {id: 'Upgrades', unl() { return true }},
        {id: 'Options', unl() { return true }},
        {id: 'Achievements', unl() { return true }},
        {id: 'Automators', unl() { return player.unlocked.includes('automators') }},
        {id: 'Rage Powers', unl() { return player.unlocked.includes('rage_powers') }},
    ],
}

const FUNCS = {
    config: {
        maxMilestones: 2,
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
        if (player.unlocked.includes('rage_powers')) gain = gain.mul(FUNCS.gains.rage_powers.effect().mul)
        if (MILESTONES.rank[4].can()) gain = gain.pow(1.25)
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
                this.doReset()
            }
        },
        doReset() {
            player.mass = E(0)
            player.upgs.mass = {}
        }
    },
    tier: {
        req() { return player.tier.add(1).pow(2) },
        can() { return player.rank.gte(this.req()) },
        reset() {
            if (this.can()) {
                player.tier = player.tier.add(1)
                this.doReset()
            }
        },
        doReset() {
            player.rank = E(1)
            FUNCS.rank.doReset()
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
        for (let j = i+1; j < player.tabs.length; j++) player.tabs[i] = 0
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
    },
    gains: {
        rage_powers: {
            points(){
                let gain = player.mass.div(1.619e23).add(1).log10().pow(2)
                if (player.upgs.rage_powers.includes(11)) gain = gain.mul(UPGS.rage_powers[11].effect())
                if (player.achs.includes(33)) gain = gain.mul(2)
                return gain.floor()
            },
            effect(){
                let eff = {}

                eff.pow = player.rage_powers.add(1).log10().mul(2)
                if (eff.pow.gte(3)) eff.pow = eff.pow.sub(3).pow(3/4).add(3)
                if (player.upgs.rage_powers.includes(12)) eff.pow = eff.pow.mul(1.15)

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
            doReset(){
                player.tier = E(1)
                FUNCS.tier.doReset()
            },
        },
    },
}

const UPGS = {
    mass: {
        name: 'mass',
        type: 'buyables',
        res: 'mass',

        cols: 3,
        1: {
            unl() { return MILESTONES.rank[1].can() },
            desc() { return 'Adds '+
                formatMass(
                    E(FUNCS.hasBuyed('mass', 2)?UPGS.mass[2].effect():1)
                    .mul(MILESTONES.rank[3].can()?FUNCS.hasUpgrade('mass', 1).div(5).add(1):1)
                    .pow(MILESTONES.rank[7].can()?1.1:1)
                )
            +' gained mass.' },
            cost(x=FUNCS.hasUpgrade('mass', 1)) { return E(E(.5).mul(MILESTONES.rank[2].can()?0.85:1).sub(MILESTONES.tier[3].can()?0.2:0).add(1)).pow(x).mul(10) },
            can() { return player.mass.gte(this.cost()) },
            effect() {
                let eff = E(1)
                if (FUNCS.hasBuyed('mass', 2)) eff = eff.mul(UPGS.mass[2].effect())
                if (MILESTONES.rank[3].can()) eff = eff.mul(FUNCS.hasUpgrade('mass', 1).div(5).add(1))
                if (MILESTONES.rank[7].can()) eff = eff.pow(1.1)
                return eff.mul(FUNCS.hasUpgrade('mass', 1))
            },
            effDesc(x=this.effect()) { return '+'+formatMass(x) },
            bulk(){
                return player.mass.div(10).add(1).logBase(E(.5).mul(MILESTONES.rank[2].can()?0.85:1).sub(MILESTONES.tier[3].can()?0.2:0).add(1)).floor()
            },
        },
        2: {
            unl() { return MILESTONES.rank[2].can() },
            desc() { return 'Multiples mass upgrade 1 effect by '+format(
                    E(1.5).pow(FUNCS.hasBuyed('mass', 3)?UPGS.mass[3].effect():1)
                    .mul(MILESTONES.rank[5].can()?player.rank.add(1).pow(MILESTONES.rank[9].can()?9/20:2/5):1)
                    .mul(MILESTONES.tier[2].can()?FUNCS.hasUpgrade('mass', 2).div(5).add(1):1)
                    , 2)+' (additive)' },
            cost(x=FUNCS.hasUpgrade('mass', 2)) { return E(5).mul(E(MILESTONES.rank[3].can()?0.9:1).sub(MILESTONES.tier[3].can()?0.2:0)).pow(x).mul(100) },
            can() { return player.mass.gte(this.cost()) },
            effect() {
                let eff = FUNCS.hasUpgrade('mass', 2).mul(E(1.5).pow(FUNCS.hasBuyed('mass', 3)?UPGS.mass[3].effect():1)
                .mul(MILESTONES.rank[5].can()?player.rank.add(1).pow(MILESTONES.rank[9].can()?9/20:2/5):1)
                .mul(MILESTONES.tier[2].can()?FUNCS.hasUpgrade('mass', 2).div(5).add(1):1)).add(1)
                return eff
            },
            effDesc(x=this.effect()) { return 'x'+format(x,1) },
            bulk(){
                return player.mass.div(100).add(1).logBase(E(5).mul(E(MILESTONES.rank[3].can()?0.9:1).sub(MILESTONES.tier[3].can()?0.2:0))).floor()
            },
        },
        3: {
            unl() { return MILESTONES.rank[3].can() },
            desc() { return 'Raises mass upgrade 2 effect by '+format(E(MILESTONES.rank[5].can()?player.rank.add(1).pow(MILESTONES.rank[9].can()?9/20:2/5):1), 2)+' (additive)' },
            cost(x=FUNCS.hasUpgrade('mass', 3)) { return E(10).mul(E(MILESTONES.rank[7].can()?0.75:1).sub(MILESTONES.tier[3].can()?0.2:0)).pow(x).mul(1000) },
            can() { return player.mass.gte(this.cost()) },
            effect() {
                let lvl = FUNCS.hasUpgrade('mass', 3)
                if (lvl.gte(10)) lvl = lvl.sub(10).pow(MILESTONES.rank[10].can()?0.775:3/4).add(10)
                return lvl.add(1).add(MILESTONES.tier[4].can()?player.rank.pow(0.525):0).mul(MILESTONES.rank[5].can()?player.rank.add(1).pow(MILESTONES.rank[9].can()?9/20:2/5):1)
            },
            effDesc(x=this.effect()) { return '^'+format(x,2) },
            bulk(){
                return player.mass.div(1000).add(1).logBase(E(10).mul(E(MILESTONES.rank[7].can()?0.75:1).sub(MILESTONES.tier[3].can()?0.2:0))).floor()
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
        rows: 1,
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
    },
    buy(name, id) {
        let cost = UPGS[name][id].cost()
        if (player[UPGS[name].res].gte(cost) && (UPGS[name].type == 'normal'?!player.upgs[name].includes(id):true)) {
            player[UPGS[name].res] = player[UPGS[name].res].sub(cost)
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
        rows: 10,
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
    },
    tier: {
        rows: 4,
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
    },
}

const ACHIEVEMENTS = {
    cols: 4,
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
    51: {
        title: 'Lets go, Universe!',
        desc() { return `Push ${formatMass('1.5e56')}. Reward: Square gear production.` },
        can() { return player.mass.gte(1.5e56) },
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