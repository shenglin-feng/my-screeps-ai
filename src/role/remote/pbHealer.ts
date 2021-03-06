import { calcBodyPart } from '@/utils'

/**
 * PowerBank 治疗单位
 * 移动并治疗 pbAttacker, 请在 8 级时生成
 * @see doc "../doc/PB 采集小组设计案"
 * @todo 治疗的时候应该禁止对穿的，现在没禁止有可能出现两个 healer 选在一个位置疯狂对穿。但是机率不大，不写了。
 * 
 * @property {} creepName 要治疗的 pbAttacker 的名字
 */
const pbHealer: CreepConfig<'pbHealer'> = {
    target: creep => {
        const targetCreep = Game.creeps[creep.memory.data.creepName]
        // 对象没了就殉情
        if (!targetCreep) {
            creep.suicide()
            return false
        }

        // 移动到身边了就治疗
        if (creep.pos.isNearTo(targetCreep)) creep.heal(targetCreep)
        else creep.goTo(targetCreep.pos)
    },
    bodys: () => calcBodyPart({ [HEAL]: 25, [MOVE]: 25 })
}

export default pbHealer