const fs = require("fs");
const path = require("path");

const getEmptyContent = () => {
    return {};
};

const parseFile = (lang, fileNmae) => {
    return JSON.parse(fs.readFileSync(path.join(__dirname, "../../data", lang, fileNmae), "utf8"));
};

const walkDir = (dir, files) => {
    walkDir_exec(dir, dir, files);
};

const walkDir_exec = (dir, original_dir, files) => {
    fs.readdirSync(dir).forEach((f) => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory
            ? walkDir_exec(dirPath, original_dir, files)
            : files.push({
                  file_name: f,
                  file_path: dirPath.replace(path.join(original_dir), ""),
                  create_time: new Date(fs.statSync(path.join(dirPath)).ctime)
              });
    });
};

const deleteFile = (file_path) => {
    if (fs.statSync(file_path).isFile()) {
        fs.unlinkSync(file_path);
    }
};

module.exports = {
    getEmptyContent,
    parseFile,
    walkDir,
    deleteFile
};
