-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "tachograph_download_date" TIMESTAMP(3),
ADD COLUMN     "tachograph_download_next_date" TIMESTAMP(3),
ADD COLUMN     "tachograph_revision_date" TIMESTAMP(3),
ADD COLUMN     "tachograph_revision_next_date" TIMESTAMP(3);
