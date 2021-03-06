export { default as RoomExtension } from './extension'
export { default as RoomConsole } from './console'

import mountShortcut from '@/modules/shortcut'
import mountTransport from '@/modules/roomTask/transpoart'
import mountWork from '@/modules/roomTask/work'
import mountCenterTransport from '@/modules/roomTask/center'
import mountShare from '@/modules/roomShare'
import mountCreepRelease from '@/modules/creepController/creepRelease'

/**
 * 依次挂载所有的 Room 拓展
 */
export default () => {
    // 挂载快捷方式
    mountShortcut()

    // 挂载 creep 发布
    mountCreepRelease()

    // 挂载三个任务队列
    mountCenterTransport()
    mountTransport()
    mountWork()

    // 挂载房间资源共享控制器
    mountShare()
}