import fs from 'fs'
import path from 'path'

const writeFileSync = (data, filePath) => {
    const downloadDir = path.dirname(filePath);
    fs.mkdirSync(downloadDir, {recursive: true})
    const jsonData = JSON.stringify(data, null, 2)

    fs.writeFileSync(filePath, jsonData, function (err) {
            if (err) throw err
            console.log('complete')
        }
    )
}

export default writeFileSync