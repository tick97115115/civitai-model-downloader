import { getPrismaClient } from "@server/settings";
import type { Creator } from "@shared/types/creators_endpoint";

export async function upsertOneCreator(creator: Creator) {
  const record = creator.username
    ? await getPrismaClient().creator.upsert({
        where: {
          username: creator.username,
        },
        update: {
          link: creator.link ? creator.link : undefined,
          image: creator.image ? creator.image : undefined,
        },
        create: {
          username: creator.username,
          link: creator.link ? creator.link : undefined,
          image: creator.image ? creator.image : undefined,
        },
      })
    : undefined;
  return record;
}
