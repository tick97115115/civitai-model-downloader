import { router, publicProcedure } from "./trpc";
import { type } from "arktype";
import { _settingsValidator } from "@shared/types/settings";
import { searchTag } from "@server/prisma/crud/tag";

export const tagsRouter = router({
  searchTag: publicProcedure
    .input(type({ tag: "string" }))
    .query(async ({ input, ctx }) => {
      const result = await searchTag(input.tag);
      return result.map((tag) => tag.name);
    }),
});
