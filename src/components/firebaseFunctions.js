import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../config/firebase";

// Fetch movie lists for a user
export const getUserMovieLists = async (uid) => {
  const lists = ["favorites", "watchlist", "watched"];
  const movieData = {};

  for (let list of lists) {
    const docRef = doc(db, "users", uid, "movieLists", list);
    const snapshot = await getDoc(docRef);

    movieData[list] = snapshot.exists() ? snapshot.data().movies : [];
  }

  return movieData;
};

// Add or remove a movie from a list
export const updateMovieList = async (uid, listName, movie, action) => {
  const listRef = doc(db, "users", uid, "movieLists", listName);

  try {
    const docSnap = await getDoc(listRef);

    if (!docSnap.exists()) {
      // Create document with initial movie array
      await setDoc(listRef, {
        movies: [movie],
      });
    } else {
      // Update document by adding or removing
      if (action === "add") {
        await updateDoc(listRef, {
          movies: arrayUnion(movie),
        });
      } else if (action === "remove") {
        await updateDoc(listRef, {
          movies: arrayRemove(movie),
        });
      }
    }
  } catch (error) {
    console.error("Error updating movie list:", error);
  }
};
