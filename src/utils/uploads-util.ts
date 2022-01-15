import { extname } from "path";
import { v4 as uuidv4 } from 'uuid';

export function imageFileFilter(req, file: Express.Multer.File, callback) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return callback(null, false);
    }
    callback(null, true);
};

export const editFileName = (req, file: Express.Multer.File, callback) => {
    const name = file.originalname.split('.')[0];
    const fileExtName = extname(file.originalname);
    const randomName = uuidv4();
    callback(null, `${name}-${randomName}${fileExtName}`);
};

export const editMapName = (req, file: Express.Multer.File, callback) => {
    const name = 'match-'.concat(req.params.matchId).concat('-').concat(Date.now().toString());
    callback(null, `${name}${extname(file.originalname)}`);
}
