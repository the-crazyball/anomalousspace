const rndInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}
const rndDouble = (min, max) => {
    return (Math.random() * (max - min) + min);
}

const selectByWeight = (arr) => {
    const weight = (arr) => {
        return [].concat(...arr.map((obj) => Array(Math.ceil(obj.weight * 100)).fill(obj))); 
    }
    let weighted = weight(arr);
    return weighted[Math.floor(Math.random() * weighted.length)]
}

const selectByChance = (types) => {
    let rnd = Math.random();
    let acc = 0;
    for (var i=0, r; r = types[i]; i++) {
      acc += r.chance;
      if (rnd < acc) return r;
    }
    // rnd wasn't less than acc, so no resource was found
    return 'empty';
}

module.exports = { 
    rndInt,
    rndDouble,
    selectByChance,
    selectByWeight
};