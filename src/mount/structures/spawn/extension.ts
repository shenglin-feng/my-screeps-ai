import { creepDefaultMemory, importantRoles } from '@/setting'
import roles from '@/role'

/**
 * Spawn 原型拓展
 */
export default class SpawnExtension extends StructureSpawn {
    /**  
     * spawn 主要工作
     * @todo 能量不足时挂起任务
     */
    public onWork(): void {
        if (this.spawning) {
            /**
             * 如果孵化已经开始了，就向物流队列推送任务
             * 不在 mySpawnCreep 返回 OK 时判断是因为：
             * 由于孵化是在 tick 末的行动执行阶段进行的，所以能量在 tick 末期才会从 extension 中扣除
             * 如果返回 OK 就推送任务的话，就会出现任务已经存在了，而 extension 还是满的
             * 而 creep 恰好就是在这段时间里执行的物流任务，就会出现如下错误逻辑：
             * mySpawnCreep 返回 OK > 推送填充任务 > creep 执行任务 > 发现能量都是满的 > **移除任务** > tick 末期开始孵化 > extension 扣除能量
             */
            if (this.spawning.needTime - this.spawning.remainingTime == 1) {
                if (!this.room.transport.hasTask('fillExtension')) this.room.transport.addTask({ type: 'fillExtension', priority: 10 })

                if (
                    // 非战争状态下直接发布 power 填 extension 任务
                    !this.room.memory.war ||
                    // 战争模式时，剩余能量掉至 50% 以下再发布 power 任务，防止 power 效果被浪费
                    (this.room.energyAvailable / this.room.energyCapacityAvailable <= 0.5)
                ) this.room.addPowerTask(PWR_OPERATE_EXTENSION, 1)
            }
            return
        }
        if (!this.room.memory.spawnList) this.room.memory.spawnList = []
        // 生成中 / 生产队列为空 就啥都不干
        if (this.spawning || this.room.memory.spawnList.length == 0) return 

        const task = this.room.memory.spawnList[0]
        this.room.visual.text(`当前孵化队列 ${this.room.memory.spawnList.join(' | ')}`, 1, 1, { align: 'left' })

        // 进行生成
        const spawnResult: MySpawnReturnCode = this.mySpawnCreep(task)

        // 生成成功后移除任务
        if (spawnResult === OK) {
            this.room.memory.spawnList.shift()
            this.log(`执行成功，移除 ${task}`)
        }
        // 能量不足就挂起任务，但是如果是重要角色的话就会卡住然后优先孵化
        else if (
            spawnResult === ERR_NOT_ENOUGH_ENERGY &&
            !importantRoles.includes(Memory.creepConfigs[task].role)
        ) this.room.hangSpawnTask()
    }

    /**
     * 从 spawn 生产 creep
     * 
     * @param configName 对应的配置名称
     * @returns Spawn.spawnCreep 的返回值
     */
    private mySpawnCreep(configName: string): MySpawnReturnCode {
        // 如果配置列表中已经找不到该 creep 的配置了 则直接移除该生成任务
        const creepConfig = Memory.creepConfigs[configName]

        if (!creepConfig) return OK
        // 找不到他的工作逻辑的话也直接移除任务
        const creepWork: CreepConfig<CreepRoleConstant> = roles[creepConfig.role]
        if (!creepWork) return OK

        // 设置 creep 内存
        let creepMemory: CreepMemory = _.cloneDeep(creepDefaultMemory)
        creepMemory.role = creepConfig.role
        creepMemory.data = creepConfig.data

        // 获取身体部件
        const bodys = creepWork.bodys(this.room, this, creepConfig.data)
        if (bodys.length <= 0) return ERR_NOT_ENOUGH_ENERGY

        const spawnResult: ScreepsReturnCode = this.spawnCreep(bodys, configName, {
            memory: creepMemory
        })
        this.room.visual.text(`mySpawnCreep 返回值 ${spawnResult}`, 1, 5, { align: 'left' })
        // 检查是否生成成功
        if (spawnResult == OK) {
            return OK
        }
        else if (spawnResult == ERR_NAME_EXISTS) {
            this.log(`${configName} 已经存在 ${creepConfig.spawnRoom} 将不再生成`)
            // 这里返回 ok，然后让外层方法移除对应的孵化任务
            return OK
        }
        else {
            // this.log(`生成失败, ${creepConfig.spawnRoom} 任务 ${configName} 挂起, 错误码 ${spawnResult}`, 'red')
            return spawnResult
        }
    }
}