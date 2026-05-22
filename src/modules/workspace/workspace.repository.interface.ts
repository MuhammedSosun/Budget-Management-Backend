import { Types } from "mongoose";
import { IWorkspace } from "../../models/workspace.model";
import { IBaseRepository } from "../../repository/IBaseRepository";

export interface IWorkspaceRepository extends IBaseRepository<IWorkspace> {
    findDefaultWorkspaceByOwnerId(
        ownerId: Types.ObjectId,
    ): Promise<IWorkspace | null>;

}