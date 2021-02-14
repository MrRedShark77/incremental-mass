const CHALGREEK = {
    ch() {
        return player.multiverse.chalGreek.choosed
    },
    run(x) {
        if (player.multiverse.chalGreek.choosed == 0) {
            player.multiverse.chalGreek.choosed = x
            FUNCS.multiverse.doReset()
        }
    },
    exit() {
        if (player.multiverse.chalGreek.choosed != 0) {
            if (player.mass.gt(this.getMass(this.ch()))) player.multiverse.chalGreek.chals[this.ch()] = player.mass
            player.multiverse.chalGreek.choosed = 0
            FUNCS.multiverse.doReset()
        }
    },
    getMass(x) {
        if (player.multiverse.chalGreek.chals[x] != undefined) return player.multiverse.chalGreek.chals[x]
        else return E(0)
    },
    
    cols: 4,
    1: {
        unl() { return player.unlocked.includes('challengreek') },
        desc() { return `Starting scaled power on rank requirements is increased. [1.5 → 2]` },
        reward() { return `Multiples mass gain.` },
        effect() {
            let eff = CHALGREEK.getMass(1).add(1).pow(0.125)
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
            return eff
        },
        effDesc(x=this.effect()) { return `-${format(x, 0)}` },
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