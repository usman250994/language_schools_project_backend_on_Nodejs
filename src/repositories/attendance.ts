import { ClassAttendance } from "../models/classAttendance";
import {
  Repository,
  getConnection,
} from "typeorm";
import { Classroom } from "src/models/Classroom";

class AttendanceRepo {
  private repo: Repository<
    ClassAttendance
  >;

  constructor() {
    this.repo = getConnection().getRepository(
      ClassAttendance
    );
  }

  async createClassAttendance(
    classroom: Classroom,
    students: any
  ): Promise<any> {
    console.log(
      "yaha tak ka scene on hai kia?",
      classroom,
      students
    );
    return Promise.all(
      students.map(
        (stud: any) =>
          this.repo.save(
            this.repo.create(
              {
                studentId:
                  stud.id,
                status:
                  stud.status,
                classroom,
              }
            )
          )
      )
    );
  }

  //   async getAll(offset: number, limit: number): Promise<[Classroom[], number]> {
  //     return this.repo.findAndCount({
  //       take: limit,
  //       skip: offset,
  //     });
  //   }
}

export default new AttendanceRepo();
