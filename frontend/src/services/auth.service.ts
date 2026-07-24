let tokenGetter: (() => Promise<string | null>) | null = null;

export const setTokenGetter = (
  getter: () => Promise<string | null>
) => {
  console.log("등록된 getter:", getter);
  console.log("타입:", typeof getter);

  tokenGetter = getter;
};

export const getToken = async () => {
  if (typeof tokenGetter !== "function") {
    console.error("tokenGetter 오류:", tokenGetter);
    return null;
  }

  return await tokenGetter();
};