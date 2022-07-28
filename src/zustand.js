import create from "zustand";

const useStore = create((set, get) => ({
  arrayProof: [],
  //set array proof
  setArrayProof: (arrayProof) => {
    set((state) => ({
      ...state,
      arrayProof,
    }));
  },
}));

export default useStore;
