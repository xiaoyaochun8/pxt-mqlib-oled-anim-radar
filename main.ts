
namespace mqlib {

    let scanStatus = 1 //0停止，1扫描
    let detectStatus = 0 //0未发现，1发现敌情
    // 雷达配置参数（可自由调整）
    const CENTER_X = 64       // 雷达圆心 X（12864屏幕中心）
    const CENTER_Y = 32       // 雷达圆心 Y
    const R1 = 10             // 最小圆半径
    const R2 = 22             // 中圆半径
    const R3 = 31             // 最大圆半径
    const SCAN_LENGTH = R3    // 扫描线长度 = 最大外圈半径
    const SCAN_STEP = 1       // 扫描线点间隔
    const SCAN_SPEED = 250     // 旋转速度（越小越快，ms）
    const LINE_COLOR = 1      // 白色显示
    // 全局变量：扫描角度
    let scanAngle = 0

    //% subcategory="oled"
    //% group='oled-雷达动画'
    //% weight=94
    //% block="oled雷达开始搜索"
    export function oledRadarAnimStartSearch() {
        scanStatus = 1
        detectStatus = 0
        OLED12864_I2C.clear()

        // 1. 清屏
        OLED12864_I2C.clear()

        // 2. 画3个雷达同心圆（底座）
        OLED12864_I2C.setOutlinedCircleData(CENTER_X, CENTER_Y, R1, LINE_COLOR)
        OLED12864_I2C.setOutlinedCircleData(CENTER_X, CENTER_Y, R2, LINE_COLOR)
        OLED12864_I2C.setOutlinedCircleData(CENTER_X, CENTER_Y, R3, LINE_COLOR)

        let xEnd = 0
        let yEnd = 0
        let xRect = 0
        let yRect = 0
        let wRect = 0
        let dspRect = 0

        // 主函数：初始化 + 循环运行
        basic.forever(() => {
            if (scanStatus == 0) {
                return
            }
            if (xEnd != 0 && yEnd != 0) {
                OLED12864_I2C.drawLine(
                    CENTER_X, CENTER_Y,
                    xEnd | 0, yEnd | 0,  // 取整坐标
                    SCAN_STEP,
                    0
                )
                if (dspRect > 6) {
                    OLED12864_I2C.rect(xRect, yRect, xRect + wRect, yRect + wRect, 0)
                }
            }

            // 3. 计算扫描线终点坐标（根据角度旋转）
            const rad = scanAngle * Math.PI / 180  // 转弧度
            xEnd = CENTER_X + Math.cos(rad) * SCAN_LENGTH
            yEnd = CENTER_Y + Math.sin(rad) * SCAN_LENGTH
            if (detectStatus == 1) {
                dspRect = 7
            } else {
                dspRect = 0
            }
            wRect = randint(1, 10)
            xRect = randint(0, 127 - wRect)
            yRect = randint(0, 63 - wRect)

            // 4. 画旋转扫描线（带间隔）
            OLED12864_I2C.drawLine(
                CENTER_X, CENTER_Y,
                xEnd | 0, yEnd | 0,  // 取整坐标
                SCAN_STEP,
                LINE_COLOR
            )
            if (dspRect > 6) {
                OLED12864_I2C.rect(xRect, yRect, xRect + wRect, yRect + wRect, 1)
            }

            // 5. 刷新屏幕
            OLED12864_I2C.draw()

            // 6. 角度递增（旋转）
            scanAngle += 15
            if (scanAngle >= 360) {
                scanAngle = 0
            }

            // 控制旋转速度
            basic.pause(SCAN_SPEED)
        })
    }
    //% subcategory="oled"
    //% group='oled-雷达动画'
    //% weight=94
    //% block="oled雷达发现敌情"
    export function oledRadarAnimEnemyDetected() {
        detectStatus = 1
    }
    //% subcategory="oled"
    //% group='oled-雷达动画'
    //% weight=94
    //% block="oled雷达停止搜索"
    export function oledRadarAnimStopSearch() {
        detectStatus = 0
        scanStatus = 0
    }
}