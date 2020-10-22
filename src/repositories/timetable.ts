import { Repository, getConnection } from "typeorm";

import { Classroom } from "../models/Classroom";
import { TimeTable } from "../models/TimeTable";

class TimeTableRepo {
  private repo: Repository<TimeTable>;

  constructor() {
    this.repo = getConnection().getRepository(TimeTable);
  }

  async create(
    classroom: Classroom,
    monday: string,
    tuesday: string,
    wednesday: string,
    thursday: string,
    friday: string
  ): Promise<TimeTable> {
    const timetable = this.repo.create({
      classroom,
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
    });

    return this.repo.save(timetable);
  }

  async findByProp(prop: Partial<TimeTable>): Promise<TimeTable | undefined> {
    const timetable = await this.repo.findOne({
      where: [{ ...prop }],
    });

    return timetable;
  }
}

export default new TimeTableRepo();
