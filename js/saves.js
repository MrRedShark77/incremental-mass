function E(x){return new ExpantaNum(x)};
function ex(x){
    let nx = new E(0);
    nx.array = x.array;
    nx.sign = x.sign;
    nx.layer = x.layer;
    return nx;
}

function calc(dt) {
    if (player.mass.add(FUNCS.gainMass().mul(dt/1000)).gte(FUNCS.getMaxMass())) {
        player.mass = FUNCS.getMaxMass()
    } else player.mass = player.mass.add(FUNCS.gainMass().mul(dt/1000))
}

function wipe() {
    player = {
        mass: E(0),
        rank: E(1),
        tier: E(1),
        upgs: {
            mass: {},
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

function loadPlayer(load) {
    player.mass = ex(load.mass)
    player.rank = ex(load.rank)
    player.tier = ex(load.tier)

    let p_upg = player.upgs, l_upg = load.upgs;
    for (let i = 0; i < Object.keys(l_upg.mass).length; i++) p_upg.mass[Object.keys(l_upg.mass)[i]] = ex(l_upg.mass[Object.keys(l_upg.mass)[i]])
}

function loadGame() {
    wipe()
    load(localStorage.getItem("incrementalMassSave"))
    loadVue()
    setInterval(save,1000)
}