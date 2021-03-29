import { Repository, getConnection } from 'typeorm';

import { Classroom } from '../models/Classroom';
import { TimeTable } from '../models/TimeTable';

class TimeTableRepo {
  private repo: Repository<TimeTable>;

  constructor() {
    this.repo = getConnection().getRepository(TimeTable);
  }

  async create(classroom: Classroom, data: Partial<TimeTable>): Promise<void> {
    const relation = await this.repo.findOne({ classroom });

    console.log('*********************8');
    console.log(relation);
    console.log('*********************8');
    if (relation) {
      this.repo.update({ id: relation.id }, data);

      return;
    }

    this.repo.save({ ...data, classroom });
  }

  async findByProp(prop: Partial<TimeTable>): Promise<TimeTable | undefined> {
    const timetable = await this.repo.findOne({
      where: [{ ...prop }],
    });

    return timetable;
  }
}

export default new TimeTableRepo();
