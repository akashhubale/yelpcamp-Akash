
const mongoose = require("mongoose");
const cities = require("./cities");
const { descriptors, places } = require("./seed-Helpers");
const Campground = require("../models/campground");


mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"))
db.once("open", () => {
    console.log("Database connected")
})

const sample = array => array[Math.floor(Math.random() * array.length)]


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const rand1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const Camp = new Campground({
            author: "63ab326e6cd810f65dd71bd2",
            location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
            title: `${sample(descriptors)}, ${sample(places)}`,
            price: price,
            geometry: {
                type: "Point",
                coordinates: [cities[rand1000].longitude,
                cities[rand1000].latitude]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dyjzeodgl/image/upload/v1675507531/yelpcamp/u8oejtoipycuivjj3nyl.jpg',
                    filename: 'yelpcamp/u8oejtoipycuivjj3nyl'
                }
            ],
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut id accusantium quia. Itaque, perferendis expedita? Esse illum consectetur harum minus! Aspernatur ad officiis unde quaerat velit ea blanditiis quasi ipsum!"
        })
        await Camp.save()
    }

}
seedDB().then(() => {
    mongoose.connection.close()
})