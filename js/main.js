var diff = 0;
var date = Date.now();
var player

const FUNCS = {
    gainMass() {
        let gain = E(1)
        if (FUNCS.hasBuyed('mass', 1)) gain = gain.add(UPGS.mass[1].effect())
        if (MILESTONES.rank[6].can()) gain = gain.mul(4)
        if (MILESTONES.rank[4].can()) gain = gain.pow(1.25)
        return gain
    },
    getMaxMass() { return E(10).pow(player.rank.sub(1).pow(1.5)
        .mul(MILESTONES.tier[1].can()?0.8:1)
        .add(1)) },
    rank: {
        can() { return player.mass.gte(FUNCS.getMaxMass()) },
        reset() {
            if (this.can()) {
                this.doReset()
            }
        },
        doReset() {
            player.rank = player.rank.add(1)
            player.mass = E(0)
            player.upgs.mass = {}
        }
    },
    tier: {
        req() { return player.tier.add(1).pow(2) },
        can() { return player.rank.gte(this.req()) },
        reset() {
            if (this.can()) {
                this.doReset()
            }
        },
        doReset() {
            player.tier = player.tier.add(1)
            player.rank = E(0)
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
                )
            +' gained mass.' },
            cost() { return E(E(.5).mul(MILESTONES.rank[2].can()?0.85:1).add(1)).pow(FUNCS.hasUpgrade('mass', 1)).mul(10) },
            can() { return player.mass.gte(this.cost()) },
            effect() {
                let eff = FUNCS.hasUpgrade('mass', 1)
                if (FUNCS.hasBuyed('mass', 2)) eff = eff.mul(UPGS.mass[2].effect())
                if (MILESTONES.rank[3].can()) eff = eff.mul(FUNCS.hasUpgrade('mass', 1).div(5).add(1))
                return eff
            },
            effDesc(x=this.effect()) { return '+'+formatMass(x) },
        },
        2: {
            unl() { return MILESTONES.rank[2].can() },
            desc() { return 'Multiples mass upgrade 1 effect by '+format(E(1.5).pow(FUNCS.hasBuyed('mass', 3)?UPGS.mass[3].effect():1).mul(MILESTONES.rank[5].can()?player.rank.add(1).pow(2/5):1), 2)+' (additive)' },
            cost() { return E(5).mul(MILESTONES.rank[3].can()?0.85:1).pow(FUNCS.hasUpgrade('mass', 2)).mul(100) },
            can() { return player.mass.gte(this.cost()) },
            effect() {
                return FUNCS.hasUpgrade('mass', 2).mul(E(1.5).pow(FUNCS.hasBuyed('mass', 3)?UPGS.mass[3].effect():1)).add(1).mul(MILESTONES.rank[5].can()?player.rank.add(1).pow(2/5):1)
            },
            effDesc(x=this.effect()) { return 'x'+format(x,1) },
        },
        3: {
            unl() { return MILESTONES.rank[3].can() },
            desc() { return 'Raises mass upgrade 2 effect by '+format(E(MILESTONES.rank[5].can()?player.rank.add(1).pow(2/5):1), 2)+' (additive)' },
            cost() { return E(10).pow(FUNCS.hasUpgrade('mass', 3)).mul(1000) },
            can() { return player.mass.gte(this.cost()) },
            effect() {
                return FUNCS.hasUpgrade('mass', 3).add(1).mul(MILESTONES.rank[5].can()?player.rank.add(1).pow(2/5):1)
            },
            effDesc(x=this.effect()) { return '^'+format(x,2) },
        },
    },
    buy(name, id) {
        let cost = UPGS[name][id].cost()
        if (player[UPGS[name].res].gte(cost) && (UPGS[name].type == 'normal'?!player.upgs[name].includes(id):true)) {
            player[UPGS[name].res] = player[UPGS[name].res].sub(cost)
            switch(UPGS[name].type) {
                case 'normal':
    
                    break
                case 'buyables':
                    if (player.upgs[name][id] == undefined) player.upgs[name][id] = E(0)
                    player.upgs[name][id] = player.upgs[name][id].add(1)
                    break
            }
        }
    },
}

const MILESTONES = {
    rank: {
        rows: 6,
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
            desc() { return 'Unlock third upgrade. Reduce mass upgrade 2 cost scaled by 15%. Mass upgrade 2 level boost this effect.' },
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
    },
    tier: {
        rows: 1,
        1: {
            desc() { return 'Reduce rank reqirements by 20%.' },
            req() { return E(2) },
            can() { return player.tier.gte(this.req()) },
        },
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
    let e = ex.log10().floor()
    if (e.lt(9)) {
        if (e.lt(3)) {
            return ex.toFixed(acc)
        }
        return ex.floor().toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    } else {
        if (ex.gte("eeee9")) {
            let slog = ex.slog()
            return (slog.gte(1e9)?'':E(10).pow(slog.sub(slog.floor())).toFixed(3)) + "F" + format(slog.floor(), 0)
        }
        let m = ex.div(E(10).pow(e))
        return (e.log10().gte(9)?'':m.toFixed(3))+'e'+format(e,0)
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