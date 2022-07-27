module.exports = {
    calculateDP: function (msg) {
		let DP = 0;

        msg.modules.forEach(m => {
            if (m.DP) {
                DP += m.DP;
            }
        });

        DP += msg.shipArmor;

        return DP;
	},
    calculateAP: function (modules) {
        let AP = 0;

        modules.forEach(m => {
            if (m.AP) {
                AP += m.AP;
            }
        })

        return AP;
    },
    calculateHPMax: function (msg) {

    }
};