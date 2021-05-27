const wait = async (ms?: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

export default wait
