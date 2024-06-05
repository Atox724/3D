<template>
  <section>Page</section>
</template>
<script lang="ts" setup>
const params = {
  filePath: "true",
  prefix:
    "/L2/segment/feature/26112/2024_06/A02-720/2024_06_03/2024_06_03_19_14_16/hmi_files",
  bucket: "sdc_adas_3"
};
const router = useRouter();
router.push({
  name: "EnggReplay",
  query: params
});
</script>
<style lang="less" scoped></style>
