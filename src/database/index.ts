import {ClientConfig, Pool, types} from "pg";
import {BaseLogger} from 'pino'
import UserModule from "./modules/UserModule";
import ExamModule from "./modules/ExamModule";
import ScoreModule from "./modules/ScoreModule";
import ResetPassModule from "./modules/ResetPassModule";

types.setTypeParser(1700, function(val) {
    return parseFloat(val);
});

export default class Database {
    private readonly db: Pool
    public user_module: UserModule
    public exam_module: ExamModule
    public score_module: ScoreModule
    public reset_pass_module: ResetPassModule

    constructor(db_config: ClientConfig, logger: BaseLogger) {
        this.db = new Pool(db_config)

        this.user_module = new UserModule(this.db, logger)
        this.exam_module = new ExamModule(this.db, logger)
        this.score_module = new ScoreModule(this.db, logger)
        this.reset_pass_module = new ResetPassModule(this.db, logger)
    }

    public async close(): Promise<void> {
        await this.db.end()
    }
}