import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Book from './models/Book.model.js';
import googleBooksService from './services/googleBooks.service.js';

dotenv.config();

const sampleBooks = [
  {
    title: "The Midnight Library",
    authors: ["Matt Haig"],
    description: "A dazzling novel about all the choices that go into a life well lived. Nora Seed finds herself faced with the possibility of changing her life for a new one, following a different career, undoing old breakups, realizing her dreams of becoming a glaciologist.",
    genres: ["fiction", "fantasy", "philosophy"],
    sections: [
      { id: "ch1", title: "Chapter 1", textSnippet: "Between life and death there is a library..." },
      { id: "ch2", title: "Chapter 2", textSnippet: "The Book of Regrets was a heavy book..." }
    ],
    metadata: {
      pages: 304,
      language: "en",
      publishDate: new Date("2020-08-13"),
      isbn: "9780525559474",
      coverImage: "https://images.example.com/midnight-library.jpg"
    },
    popularity: {
      reads: 5420,
      likes: 4200,
      ratings: { count: 3500, average: 4.5 }
    }
  },
  {
    title: "Atomic Habits",
    authors: ["James Clear"],
    description: "An Easy & Proven Way to Build Good Habits & Break Bad Ones. No matter your goals, Atomic Habits offers a proven framework for improving--every day.",
    genres: ["self-help", "business", "psychology"],
    sections: [
      { id: "intro", title: "Introduction", textSnippet: "Habits are the compound interest of self-improvement..." },
      { id: "ch1", title: "The Surprising Power of Atomic Habits", textSnippet: "It is so easy to overestimate the importance of one defining moment..." }
    ],
    metadata: {
      pages: 320,
      language: "en",
      publishDate: new Date("2018-10-16"),
      isbn: "9780735211292",
      coverImage: "https://images.example.com/atomic-habits.jpg"
    },
    popularity: {
      reads: 8900,
      likes: 7200,
      ratings: { count: 6800, average: 4.8 }
    }
  },
  {
    title: "Project Hail Mary",
    authors: ["Andy Weir"],
    description: "A lone astronaut must save the earth from disaster in this incredible new science-based thriller from the author of The Martian.",
    genres: ["science fiction", "adventure", "thriller"],
    sections: [
      { id: "ch1", title: "Chapter 1", textSnippet: "I don't know where I am..." },
      { id: "ch2", title: "Chapter 2", textSnippet: "I awake to the sound of an alarm..." }
    ],
    metadata: {
      pages: 496,
      language: "en",
      publishDate: new Date("2021-05-04"),
      isbn: "9780593135204",
      coverImage: "https://images.example.com/hail-mary.jpg"
    },
    popularity: {
      reads: 6300,
      likes: 5100,
      ratings: { count: 4900, average: 4.7 }
    }
  },
  {
    title: "The Silent Patient",
    authors: ["Alex Michaelides"],
    description: "A woman's act of violence against her husband-and of the therapist obsessed with uncovering her motive.",
    genres: ["thriller", "mystery", "psychological"],
    sections: [
      { id: "part1", title: "Part One", textSnippet: "Alicia Berenson was thirty-three years old..." }
    ],
    metadata: {
      pages: 336,
      language: "en",
      publishDate: new Date("2019-02-05"),
      isbn: "9781250301697",
      coverImage: "https://images.example.com/silent-patient.jpg"
    },
    popularity: {
      reads: 7800,
      likes: 6400,
      ratings: { count: 5900, average: 4.3 }
    }
  },
  {
    title: "Where the Crawdads Sing",
    authors: ["Delia Owens"],
    description: "For years, rumors of the 'Marsh Girl' have haunted Barkley Cove. So in late 1969, when handsome Chase Andrews is found dead, the locals immediately suspect Kya Clark.",
    genres: ["fiction", "mystery", "romance"],
    sections: [
      { id: "prologue", title: "Prologue", textSnippet: "1969. The morning burned so August-hot..." }
    ],
    metadata: {
      pages: 384,
      language: "en",
      publishDate: new Date("2018-08-14"),
      isbn: "9780735219090",
      coverImage: "https://images.example.com/crawdads.jpg"
    },
    popularity: {
      reads: 9200,
      likes: 7800,
      ratings: { count: 7200, average: 4.6 }
    }
  },
  {
    title: "Sapiens: A Brief History of Humankind",
    authors: ["Yuval Noah Harari"],
    description: "From a renowned historian comes a groundbreaking narrative of humanity's creation and evolution.",
    genres: ["history", "philosophy", "science"],
    sections: [
      { id: "part1", title: "The Cognitive Revolution", textSnippet: "About 70,000 years ago, Homo sapiens..." }
    ],
    metadata: {
      pages: 464,
      language: "en",
      publishDate: new Date("2015-02-10"),
      isbn: "9780062316097",
      coverImage: "https://images.example.com/sapiens.jpg"
    },
    popularity: {
      reads: 10500,
      likes: 8900,
      ratings: { count: 8200, average: 4.7 }
    }
  },
  {
    title: "The Song of Achilles",
    authors: ["Madeline Miller"],
    description: "A tale of gods, kings, immortal fame and the human heart, THE SONG OF ACHILLES is a dazzling literary feat.",
    genres: ["fiction", "mythology", "romance", "historical"],
    sections: [
      { id: "ch1", title: "Chapter One", textSnippet: "My father was a king and the son of kings..." }
    ],
    metadata: {
      pages: 352,
      language: "en",
      publishDate: new Date("2012-03-06"),
      isbn: "9780062060624",
      coverImage: "https://images.example.com/achilles.jpg"
    },
    popularity: {
      reads: 5600,
      likes: 4900,
      ratings: { count: 4500, average: 4.8 }
    }
  },
  {
    title: "Educated",
    authors: ["Tara Westover"],
    description: "A memoir about a young girl who, kept out of school, leaves her survivalist family and goes on to earn a PhD from Cambridge University.",
    genres: ["biography", "memoir", "non-fiction"],
    sections: [
      { id: "prologue", title: "Prologue", textSnippet: "I'm standing on the red railway car..." }
    ],
    metadata: {
      pages: 334,
      language: "en",
      publishDate: new Date("2018-02-20"),
      isbn: "9780399590504",
      coverImage: "https://images.example.com/educated.jpg"
    },
    popularity: {
      reads: 7300,
      likes: 6200,
      ratings: { count: 5800, average: 4.7 }
    }
  },
  {
    title: "Anxious People",
    authors: ["Fredrik Backman"],
    description: "A bank robber accidentally holds up a real estate viewing and the eight strangers trapped inside become united by their common experience.",
    genres: ["fiction", "comedy", "drama"],
    sections: [
      { id: "ch1", title: "Chapter 1", textSnippet: "This story is about a lot of things..." }
    ],
    metadata: {
      pages: 352,
      language: "en",
      publishDate: new Date("2020-09-08"),
      isbn: "9781501160837",
      coverImage: "https://images.example.com/anxious-people.jpg"
    },
    popularity: {
      reads: 4800,
      likes: 4100,
      ratings: { count: 3900, average: 4.4 }
    }
  },
  {
    title: "The Seven Husbands of Evelyn Hugo",
    authors: ["Taylor Jenkins Reid"],
    description: "Aging and reclusive Hollywood movie icon Evelyn Hugo is finally ready to tell the truth about her glamorous and scandalous life.",
    genres: ["fiction", "romance", "historical", "drama"],
    sections: [
      { id: "prologue", title: "Prologue", textSnippet: "Evelyn Hugo is getting married..." }
    ],
    metadata: {
      pages: 400,
      language: "en",
      publishDate: new Date("2017-06-13"),
      isbn: "9781501139239",
      coverImage: "https://images.example.com/evelyn-hugo.jpg"
    },
    popularity: {
      reads: 6700,
      likes: 5800,
      ratings: { count: 5400, average: 4.6 }
    }
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing books
    await Book.deleteMany({});
    console.log('🗑️  Cleared existing books');

    // Fetch cover images from Google Books for each book
    console.log('🔍 Fetching cover images from Google Books...');
    for (const book of sampleBooks) {
      const author = book.authors[0];
      const coverImage = await googleBooksService.getCoverImageByTitle(
        book.title,
        author
      );
      
      if (coverImage) {
        book.metadata.coverImage = coverImage;
        console.log(`✅ Found cover for: ${book.title}`);
      } else {
        console.log(`⚠️  No cover found for: ${book.title}`);
      }
    }

    // Insert sample books with cover images
    await Book.insertMany(sampleBooks);
    console.log(`✅ Seeded ${sampleBooks.length} books`);

    console.log('✨ Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
