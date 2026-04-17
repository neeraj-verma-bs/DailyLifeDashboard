import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { validate } from "../../middleware/validate.js";
import {
  addCommentSchema,
  bulkDeleteSchema,
  bulkStatusSchema,
  createEntrySchema,
  exportQuerySchema,
  listEntriesQuerySchema,
  updateEntrySchema,
} from "./schema.js";
import {
  bulkPatchStatus,
  bulkRemove,
  exportHandler,
  getEntries,
  patchEntry,
  postComment,
  postEntry,
  removeComment,
  removeEntry,
} from "./controller.js";

export const entriesRouter = Router();

entriesRouter.use(requireAuth);

entriesRouter.post("/bulk-delete", validate(bulkDeleteSchema), bulkRemove);
entriesRouter.post("/bulk-status", validate(bulkStatusSchema), bulkPatchStatus);
entriesRouter.get("/export", validate(exportQuerySchema, "query"), exportHandler);

entriesRouter.get("/", validate(listEntriesQuerySchema, "query"), getEntries);
entriesRouter.post("/", validate(createEntrySchema), postEntry);
entriesRouter.patch("/:id", validate(updateEntrySchema), patchEntry);
entriesRouter.delete("/:id", removeEntry);

entriesRouter.post("/:id/comments", validate(addCommentSchema), postComment);
entriesRouter.delete("/:id/comments/:cid", removeComment);
