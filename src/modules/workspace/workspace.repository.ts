import { Types } from "mongoose";
import Workspace, { IWorkspace } from "../../models/workspace.model";
import { BaseRepository } from "../../repository/mongoose/BaseRepository";
import { IWorkspaceRepository } from "./workspace.repository.interface";

export class WorkspaceRepository
    extends BaseRepository<IWorkspace>
    implements IWorkspaceRepository {
    constructor() {
        super(Workspace);
    }

    async findDefaultWorkspaceByOwnerId(
        ownerId: Types.ObjectId,
    ): Promise<IWorkspace | null> {
        return this.model
            .findOne({
                ownerId,
                isDefault: true,
            })
            .exec();
    }


}