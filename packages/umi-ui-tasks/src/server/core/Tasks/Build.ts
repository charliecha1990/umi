import { BaseTask, ITaskOptions } from './Base';
import { TaskType, TaskState } from '../enums';
import { parseScripts, runCommand } from '../../util';

export class BuildTask extends BaseTask {
  constructor(opts: ITaskOptions) {
    super(opts);
    this.type = TaskType.BUILD;
  }

  public async run(env: any = {}) {
    await super.run();
    const { script, envs: scriptEnvs } = this.getScript();
    this.proc = runCommand(script, {
      cwd: this.cwd,
      env: {
        ...env,
        ...scriptEnvs,
      }, // 前端传入的 env
    });

    this.handleChildProcess(this.proc);
    // 进度条更新
    this.proc.on('message', msg => {
      if (this.state !== TaskState.ING) {
        return;
      }
      const { type } = msg;
      if (type === 'STARTING') {
        this.updateProgress(msg);
      }
    });
  }

  public getDetail() {
    return {
      ...super.getDetail(),
      progress: this.progress,
    };
  }

  private getScript(): { script: string; envs: object } {
    const { succes, exist, errMsg, envs, bin } = parseScripts({
      pkgPath: this.pkgPath,
      key: 'build',
    });

    if (!exist) {
      return {
        script: this.isBigfishProject ? 'bigfish build' : 'umi build',
        envs: [],
      };
    }
    if (!succes) {
      this.error(errMsg);
    }
    return {
      script: `${bin} build`,
      envs,
    };
  }
}
