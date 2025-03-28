import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { GiHealingShield, GiPoisonBottle, GiHeartBeats, GiBloodyStash, GiBurn } from 'react-icons/gi';

const iconMap = {
  'trauma': GiHealingShield,
  'poisoning': GiPoisonBottle,
  'cpr': GiHeartBeats,
  'bleeding': GiBloodyStash,
  'burn': GiBurn
};

const iconMapTitle = {
  'trauma': '创伤急救',
  'poisoning': '中毒急救',
  'cpr': '心肺复苏',
  'bleeding': '止血处理',
  'burn': '烧伤处理'
};
// trauma poisoning cpr bleeding burn

export default function Navigation({ categories }) {
  return (
    <nav className="navbar">
      {categories.map(category => {
        const IconComponent = iconMap[category.categoryKey];
        return (
          <NavLink 
            key={category.id}
            to={`/${encodeURIComponent(category.categoryKey)}`}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            {IconComponent && <IconComponent />}
            { iconMapTitle[category.categoryKey] != null ? iconMapTitle[category.categoryKey] : category.categoryKey}
          </NavLink>
        );
      })}
    </nav>
  );
}