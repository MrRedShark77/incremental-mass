const CHALGREEK = {
    ch() {
        return player.multiverse.chalGreek.choosed
    },
    run(x) {
        if (player.multiverse.chalGreek.choosed == 0) {
            player.multiverse.chalGreek.choosed = x
            FUNCS.multiverse.doReset('chalgreek')
        }
    },
    exit() {
        if (player.multiverse.chalGreek.choosed != 0) {
            if (player.mass.gt(this.getMass(this.ch()))) player.multiverse.chalGreek.chals[this.ch()] = player.mass
            player.multiverse.chalGreek.choosed = 0
            FUNCS.multiverse.doReset('chalgreek')
        }
    },
    getMass(x) {
        if (player.multiverse.chalGreek.chals[x] != undefined) return player.multiverse.chalGreek.chals[x]
        else return E(0)
    },
    
    cols: 5,
    1: {
        unl() { return player.unlocked.includes('challengreek') },
        desc() { return `Starting scaled power on rank requirements is increased. [1.5 → 2]` },
        reward() { return `Multiples mass gain.` },
        effect() {
            let eff = CHALGREEK.getMass(1).add(1).pow(0.125)
            if (CHALGREEK[5].unl()) eff = eff.pow(CHALGREEK[5].effect())
            return eff
        },
        effDesc(x=this.effect()) { return `x${format(x)}` },
    },
    2: {
        unl() { return player.unlocked.includes('challengreek') },
        desc() { return `DM upgrades no longer give effects.` },
        reward() { return `Multiples RP gain.` },
        effect() {
            let eff = CHALGREEK.getMass(2).add(1).log10().add(1)
            if (CHALGREEK[5].unl()) eff = eff.pow(CHALGREEK[5].effect())
            return eff
        },
        effDesc(x=this.effect()) { return `x${format(x)}` },
    },
    3: {
        unl() { return player.unlocked.includes('challengreek') },
        desc() { return `Mass Powers is raised by 0.0625.` },
        reward() { return `Multiples Mass Power gain.` },
        effect() {
            let eff = CHALGREEK.getMass(3).add(1).pow(0.2)
            if (CHALGREEK[5].unl()) eff = eff.pow(CHALGREEK[5].effect())
            if (eff.gte('e10000000')) eff = eff.div('e10000000').pow(0.9).mul('e10000000')
            if (eff.gte('e100000000')) eff = eff.div('e100000000').pow(0.9).mul('e100000000')
            return eff
        },
        effDesc(x=this.effect()) { return `x${format(x)}` },
    },
    4: {
        unl() { return player.unlocked.includes('challengreek') },
        desc() { return `The game has ONLY rank.` },
        reward() { return `Substracts rank requirements.` },
        effect() {
            let eff = CHALGREEK.getMass(4).add(1).log10().pow(0.6).mul(2)
            if (CHALGREEK[5].unl()) eff = eff.mul(CHALGREEK[5].effect())
            return eff
        },
        effDesc(x=this.effect()) { return `-${format(x, 0)}` },
    },
    5: {
        unl() { return player.upgs.gp.includes(55) },
        desc() { return `Activate Challenges Alpha, Beta, Gamma & Delta.` },
        reward() { return `Challenges Alpha-Delta are stronger.` },
        effect() {
            let eff = CHALGREEK.getMass(5).add(1).log10().add(1).pow(0.03125)
            return eff
        },
        effDesc(x=this.effect()) { return `${format(x.sub(1).mul(100))}%` },
    },

    /*
    1: {
        unl() { return player.unlocked.includes('challengreek') },
        desc() { return `Placeholder.` },
        reward() { return `Placeholder.` },
        effect() {
            let eff = E(1)
            return eff
        },
        effDesc(x=this.effect()) { return `x${format(x)}` },
    },
    */
}