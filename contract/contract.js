import {Contract} from 'trac-peer'

class SampleContract extends Contract {
    /**
     * Extending from Contract inherits its capabilities and allows you to define your own contract.
     * The contract supports the corresponding protocol. Both files come in pairs.
     *
     * Instances of this class run in contract context. The constructor is only called once on Peer
     * instantiation.
     *
     * Please avoid using the following in your contract functions:
     *
     * No try-catch
     * No throws
     * No random values
     * No http / api calls
     * No super complex, costly calculations
     * No massive storage of data.
     * Never, ever modify "this.op" or "this.value", only read from it and use safeClone to modify.
     * ... basically nothing that can lead to inconsistencies akin to Blockchain smart contracts.
     *
     * Running a contract on Trac gives you a lot of freedom, but it comes with additional responsibility.
     * Make sure to benchmark your contract performance before release.
     *
     * If you need to inject data from "outside", you can utilize the Feature class and create your own
     * oracles. Instances of Feature can be injected into the main Peer instance and enrich your contract.
     *
     * In the current version (Release 1), there is no inter-contract communication yet.
     * This means it's not suitable yet for token standards.
     * However, it's perfectly equipped for interoperability or standalone tasks.
     *
     * this.protocol: the peer's instance of the protocol managing contract concerns outside of its execution.
     * this.options: the option stack passed from Peer instance
     *
     * @param protocol
     * @param options
     */
    constructor(protocol, options = {}) {
        // calling super and passing all parameters is required.
        super(protocol, options);

        this.addSchema('syncDeliveryLane', {
            value : {
                $$strict : true,
                $$type: "object",
                op : { type : "string", min : 1, max: 128 },
                status : { type : "string", min : 1, max: 128 },
                note : { type : "string", min : 1, max: 256 }
            }
        });
        this.addFunction('peekDeliveryLane');

        // in preparation to add an external Feature (aka oracle), we add a loose schema to make sure
        // the Feature key is given properly. it's not required, but showcases that even these can be
        // sanitized.
        this.addSchema('feature_entry', {
            key : { type : "string", min : 1, max: 256 },
            value : { type : "any" }
        });

        // read helpers (no state writes)
        this.addFunction('readSnapshot');
        this.addFunction('readChatLast');
        this.addFunction('readTimer');

        // now we are registering the timer feature itself (see /features/time/ in package).
        // note the naming convention for the feature name <feature-name>_feature.
        // the feature name is given in app setup, when passing the feature classes.
        const _this = this;

        // this feature registers incoming data from the Feature and if the right key is given,
        // stores it into the smart contract storage.
        // the stored data can then be further used in regular contract functions.
        this.addFeature('timer_feature', async function(){
            if(false === _this.check.validateSchema('feature_entry', _this.op)) return;
            if(_this.op.key === 'currentTime') {
                if(null === await _this.get('currentTime')) console.log('timer started at', _this.op.value);
                await _this.put(_this.op.key, _this.op.value);
            }
        });

        // last but not least, you may intercept messages from the built-in
        // chat system, and perform actions similar to features to enrich your
        // contract. check the _this.op value after you enabled the chat system
        // and posted a few messages.
        this.messageHandler(async function(){
            if(_this.op?.type === 'msg' && typeof _this.op.msg === 'string'){
                const currentTime = await _this.get('currentTime');
                await _this.put('chat_last', {
                    msg: _this.op.msg,
                    address: _this.op.address ?? null,
                    at: currentTime ?? null
                });
            }
            console.log('message triggered contract', _this.op);
        });
    }

    async syncDeliveryLane(){
        const status = typeof this.value?.status === 'string' ? this.value.status.trim() : '';
        const note = typeof this.value?.note === 'string' ? this.value.note.trim() : '';
        if(status === '' || note === ''){
            return new Error('status and note are required');
        }

        const laneCard = {
            op: this.value.op,
            status,
            note,
            updatedBy: this.address,
            updatedAt: await this.get('currentTime'),
        };

        await this.put('delivery_lane_status', laneCard);
        console.log('delivery lane synced', laneCard);
    }

    async peekDeliveryLane(){
        const laneCard = await this.get('delivery_lane_status');
        console.log('delivery_lane_status:', laneCard);
    }

    async readSnapshot(){
        const deliveryLaneStatus = await this.get('delivery_lane_status');
        const currentTime = await this.get('currentTime');
        const msgl = await this.get('msgl');
        const msg0 = await this.get('msg/0');
        const msg1 = await this.get('msg/1');
        console.log('snapshot', {
            deliveryLaneStatus,
            currentTime,
            msgl: msgl ?? 0,
            msg0,
            msg1
        });
    }

    async readChatLast(){
        const last = await this.get('chat_last');
        console.log('chat_last:', last);
    }

    async readTimer(){
        const currentTime = await this.get('currentTime');
        console.log('currentTime:', currentTime);
    }
}

export default SampleContract;
