import { Achievement } from "../types";

export const ACHIEVEMENTS: Achievement[] = [
  {
    src: "https://assets.metasoccer.com/badges/early-adopter.png?v=2",
    alt: "Early Adopter Medal",
    title: "Early Adopter",
    isAchieved: () => true,
  },
  {
    src: "https://assets.metasoccer.com/badges/referrer.png?v=2",
    alt: "Referrer Medal",
    title: "Referrer",
    isAchieved: ({ referralCount }) => referralCount >= 3,
  },
];

export const GAME_CARDS = [
  {
    title: "Discord",
    description: "Join our Discord server to connect with other users and get the latest news.",
    image: "https://assets.metasoccer.com/banner/discord.png?v=1",
    url: "https://0xfutbol.com/discord",
    buttonText: "Join"
  },
  {
    title: "MetaSoccer", 
    description: "Multi-player soccer manager game offering rewards for competitions.", 
    image: "https://assets.metasoccer.com/banner/metasoccer.png?v=1", 
    url: "https://app.metasoccer.com?utm_source=msid&utm_medium=profile&utm_campaign=game_card", 
    buttonText: "Play" 
  },
  { 
    title: "Wonderkid", 
    description: "Telegram mini-game to raise the next super star.", 
    image: "https://assets.metasoccer.com/banner/wonderkid.png?v=2", 
    url: "https://0xfutbol.com/wonderkid?utm_source=msid&utm_medium=profile&utm_campaign=game_card", 
    buttonText: "Play" 
  },
  { 
    title: "Ultras", 
    description: "The official NFT Collection of the 0xFútbol community.", 
    image: "https://assets.metasoccer.com/banner/ultras.png?v=4", 
    url: "https://opensea.io/collection/ultras-by-0xfutbol", 
    buttonText: "Explore" 
  },
]; 